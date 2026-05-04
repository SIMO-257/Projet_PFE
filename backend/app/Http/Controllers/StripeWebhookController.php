<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

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
            $event = Webhook::constructEvent(
                $payload, $sigHeader, $endpointSecret
            );
        } catch (\UnexpectedValueException $e) {
            // Invalid payload
            return response()->json(['message' => 'Invalid payload'], 400);
        } catch (SignatureVerificationException $e) {
            // Invalid signature
            Log::error('Stripe Webhook signature verification failed: ' . $e->getMessage());
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        // Handle the event
        switch ($event->type) {
            case 'payment_intent.succeeded':
                $paymentIntent = $event->data->object;
                return $this->handlePaymentIntentSucceeded($paymentIntent);

            default:
                // Received unknown event type
                return response()->json(['message' => 'Received unknown event type: ' . $event->type], 200);
        }
    }

    /**
     * Process successful payment intent for wallet recharge.
     */
    protected function handlePaymentIntentSucceeded($paymentIntent)
    {
        $paymentIntentId = $paymentIntent->id;
        $userId = $paymentIntent->metadata->user_id ?? null;
        $amountInCents = $paymentIntent->amount;
        $amountInDh = $amountInCents / 100;

        if (!$userId) {
            Log::warning("Stripe Webhook: payment_intent.succeeded missing user_id in metadata. PI: $paymentIntentId");
            return response()->json(['message' => 'User ID missing in metadata'], 200);
        }

        try {
            return DB::transaction(function () use ($userId, $amountInDh, $paymentIntentId, $paymentIntent) {
                // 1. Idempotency Check: Prevent duplicate processing of the same PaymentIntent
                $existingTransaction = Transaction::where('reference', $paymentIntentId)->first();
                if ($existingTransaction) {
                    Log::info("Stripe Webhook: PaymentIntent $paymentIntentId already processed.");
                    return response()->json(['message' => 'Payment already processed'], 200);
                }

                // 2. Lock the wallet for update
                $wallet = Wallet::where('user_id', $userId)->lockForUpdate()->first();
                
                if (!$wallet) {
                    $wallet = Wallet::create([
                        'user_id' => $userId,
                        'balance' => 0.00,
                        'card_last_four' => '****'
                    ]);
                }

                $balanceBefore = $wallet->balance;

                // 3. Update balance
                $wallet->balance += $amountInDh;
                
                // Extract card info if available
                if (isset($paymentIntent->latest_charge)) {
                    $charge = \Stripe\Charge::retrieve($paymentIntent->latest_charge);
                    if (isset($charge->payment_method_details->card)) {
                        $wallet->card_last_four = $charge->payment_method_details->card->last4;
                    }
                }

                $wallet->save();

                // 4. Record Transaction
                Transaction::create([
                    'user_id' => $userId,
                    'type' => 'recharge',
                    'status' => 'completed',
                    'amount' => $amountInDh,
                    'balance_before' => $balanceBefore,
                    'balance_after' => $wallet->balance,
                    'payment_method' => 'card',
                    'reference' => $paymentIntentId,
                    'metadata' => [
                        'stripe_payment_intent' => $paymentIntentId,
                        'source' => 'stripe_webhook'
                    ],
                ]);

                Log::info("Stripe Webhook: Successfully recharged wallet for User ID $userId. Amount: $amountInDh DH. PI: $paymentIntentId");

                return response()->json(['message' => 'Wallet successfully recharged'], 200);
            });
        } catch (\Exception $e) {
            Log::error("Stripe Webhook: Error processing wallet recharge for PI $paymentIntentId: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error during processing'], 500);
        }
    }
}
