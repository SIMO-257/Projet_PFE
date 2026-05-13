<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Redis;
use App\Events\LowBalanceEvent;


class StripeWebhookController extends Controller
{
    /**
     * Handle incoming Stripe webhooks.
     */
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (\UnexpectedValueException $e) {
            return response()->json(['message' => 'Invalid payload'], 400);
        } catch (SignatureVerificationException $e) {
            Log::error('Stripe Webhook signature verification failed: ' . $e->getMessage());
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        $alreadyProcessed = DB::table('processed_stripe_events')->where('event_id', $event->id)->exists();
        if ($alreadyProcessed) {
            return response()->json(['message' => 'Event already processed'], 200);
        }

        switch ($event->type) {
            case 'payment_intent.succeeded':
                $result = $this->handlePaymentIntentSucceeded($event->data->object);
                break;
            case 'payment_intent.payment_failed':
                $result = $this->handlePaymentIntentFailed($event->data->object);
                break;
            default:
                return response()->json(['message' => 'Received unknown event type: ' . $event->type], 200);
        }

        if ($result->getStatusCode() === 200) {
            DB::table('processed_stripe_events')->insert(['event_id' => $event->id]);
        }

        return $result;
    }

    /**
     * Process failed payment intent.
     */
    protected function handlePaymentIntentFailed($paymentIntent)
    {
        $userId = $paymentIntent->metadata->user_id ?? null;
        $errorMessage = $paymentIntent->last_payment_error
            ? $paymentIntent->last_payment_error->message
            : 'Une erreur est survenue lors du paiement.';

        if ($userId) {
            $client = Client::find($userId);
            if ($client) {
                try {
                    app(NotificationService::class)->send(
                        $client,
                        'payment',
                        'danger',
                        'Echec de paiement',
                        "Votre rechargement a echoue : {$errorMessage}",
                        ['payment_intent' => $paymentIntent->id, 'error' => $errorMessage]
                    );
                } catch (\Throwable $notificationError) {
                    Log::warning('Stripe Webhook: failure notification skipped', [
                        'payment_intent_id' => $paymentIntent->id ?? null,
                        'error' => $notificationError->getMessage(),
                    ]);
                }
            }
        }

        return response()->json(['message' => 'Failure handled'], 200);
    }

    /**
     * Process successful payment intent for wallet recharge.
     */
    protected function handlePaymentIntentSucceeded($paymentIntent)
    {
        $paymentIntentId = $paymentIntent->id;
        $userId = $paymentIntent->metadata->user_id ?? null;
        $type = $paymentIntent->metadata->type ?? 'wallet_recharge';
        $amountInDh = $paymentIntent->amount / 100;
        $currency = strtoupper($paymentIntent->currency);

        if (!$userId) {
            Log::warning("Stripe Webhook: payment_intent.succeeded missing user_id in metadata. PI: $paymentIntentId");
            return response()->json(['message' => 'User ID missing in metadata'], 200);
        }

        if ($type !== 'wallet_recharge') {
            Log::info("Stripe Webhook: Received non-recharge type: $type. PI: $paymentIntentId");
            return response()->json(['message' => 'Not a wallet recharge'], 200);
        }

        try {
            return DB::transaction(function () use ($userId, $amountInDh, $paymentIntentId, $paymentIntent, $currency) {
                $wallet = Wallet::where('user_id', $userId)->lockForUpdate()->first();
                if (!$wallet) {
                    $wallet = Wallet::create([
                        'user_id' => $userId,
                        'balance' => 0.00,
                        'card_last_four' => '****',
                    ]);
                    $wallet->refresh();
                }

                $existingTransaction = Transaction::where('payment_intent_id', $paymentIntentId)->first();
                if ($existingTransaction) {
                    Log::info("Stripe Webhook: Payment $paymentIntentId already processed.", [
                        'transaction_id' => $existingTransaction->id,
                        'user_id' => $userId,
                    ]);
                    return response()->json(['message' => 'Payment already processed'], 200);
                }

                $balanceBefore = (float) $wallet->balance;
                $wallet->balance = $balanceBefore + $amountInDh;

                $latestChargeId = $paymentIntent->latest_charge;
                if ($latestChargeId) {
                    try {
                        $charge = \Stripe\Charge::retrieve($latestChargeId);
                        if (isset($charge->payment_method_details->card)) {
                            $wallet->card_last_four = $charge->payment_method_details->card->last4;
                        }
                    } catch (\Exception $e) {
                        Log::warning('Stripe Webhook: Could not retrieve charge details for card_last_four: ' . $e->getMessage());
                    }
                }

                $wallet->save();

                $transaction = Transaction::firstOrCreate(
                    ['payment_intent_id' => $paymentIntentId],
                    [
                        'user_id' => $userId,
                        'type' => 'recharge',
                        'status' => 'completed',
                        'amount' => $amountInDh,
                        'currency' => $currency,
                        'balance_before' => $balanceBefore,
                        'balance_after' => (float) $wallet->balance,
                        'payment_method' => 'card',
                        'reference' => 'Rechargement via Stripe',
                        'metadata' => [
                            'stripe_payment_intent' => $paymentIntentId,
                            'source' => 'stripe_webhook',
                            'type' => 'wallet_recharge',
                        ],
                    ]
                );

                Log::info("Stripe Webhook: transaction created for $paymentIntentId", [
                    'transaction_id' => $transaction->id,
                    'user_id' => $userId,
                ]);

                $client = Client::find($userId);
                if ($client) {
                    try {
                        app(NotificationService::class)->send(
                            $client,
                            'payment',
                            'success',
                            'Recharge reussie',
                            "Votre compte a ete credite de {$amountInDh} DH. Nouveau solde : {$wallet->balance} DH.",
                            ['amount' => $amountInDh, 'new_balance' => $wallet->balance]
                        );
                    } catch (\Throwable $notificationError) {
                        Log::warning('Stripe Webhook: success notification skipped', [
                            'payment_intent_id' => $paymentIntentId,
                            'error' => $notificationError->getMessage(),
                        ]);
                    }

                    Redis::del("low_balance_notif:{$client->id}");
                    event(new LowBalanceEvent($client, $wallet->balance));
                }

                Log::info("Stripe Webhook: Successfully processed wallet_recharge for user $userId. Amount: $amountInDh $currency");
                return response()->json(['message' => 'Wallet recharged successfully'], 200);
            });
        } catch (\Exception $e) {
            Log::error("Stripe Webhook: Error processing payment for PI $paymentIntentId: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
}
