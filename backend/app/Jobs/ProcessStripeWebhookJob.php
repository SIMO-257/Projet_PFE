<?php

namespace App\Jobs;

use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\Client;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use App\Services\NotificationService;
use App\Events\LowBalanceEvent;

class ProcessStripeWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of unhandled exceptions to allow before failing.
     */
    public int $maxExceptions = 1;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $eventId,
        public string $eventType,
        public array  $eventData,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // The controller already guarantees idempotency via pre-insert
        // into processed_stripe_events, so we skip that check here.
        // The transaction-level duplicate check (existing transaction lookup)
        // provides additional safety within the succeed handler.

        match ($this->eventType) {
            'payment_intent.succeeded'    => $this->handlePaymentIntentSucceeded(),
            'payment_intent.payment_failed' => $this->handlePaymentIntentFailed(),
            default => Log::info('StripeWebhookJob: Unknown event type', [
                'event_id' => $this->eventId,
                'type'     => $this->eventType,
            ]),
        };

        // Record as processed (only on success — let retries re-attempt on failure)
        DB::table('processed_stripe_events')
            ->upsert(
                ['event_id' => $this->eventId, 'created_at' => now()],
                ['event_id'],
                ['created_at']
            );
    }

    /**
     * Process a failed payment intent.
     */
    protected function handlePaymentIntentFailed(): void
    {
        $paymentIntent = $this->eventData;
        $userId = $paymentIntent['metadata']['user_id'] ?? null;
        $errorMessage = $paymentIntent['last_payment_error']['message']
            ?? 'Une erreur est survenue lors du paiement.';

        if (!$userId) {
            Log::warning('StripeWebhookJob: payment_intent.payment_failed missing user_id', [
                'payment_intent_id' => $paymentIntent['id'] ?? null,
            ]);
            return;
        }

        $client = Client::find($userId);
        if (!$client) {
            Log::warning('StripeWebhookJob: payment_intent.payment_failed — client not found', [
                'user_id' => $userId,
            ]);
            return;
        }

        try {
            app(NotificationService::class)->send(
                $client,
                'payment',
                'danger',
                'Échec de paiement',
                "Votre rechargement a échoué : {$errorMessage}",
                ['payment_intent' => $paymentIntent['id'] ?? null, 'error' => $errorMessage]
            );
        } catch (\Throwable $e) {
            Log::warning('StripeWebhookJob: failure notification skipped', [
                'payment_intent_id' => $paymentIntent['id'] ?? null,
                'error'             => $e->getMessage(),
            ]);
        }
    }

    /**
     * Process a successful payment intent for wallet recharge.
     */
    protected function handlePaymentIntentSucceeded(): void
    {
        $paymentIntent = $this->eventData;
        $paymentIntentId = $paymentIntent['id'] ?? '';
        $userId = $paymentIntent['metadata']['user_id'] ?? null;
        $type = $paymentIntent['metadata']['type'] ?? 'wallet_recharge';
        $amountInDh = ($paymentIntent['amount'] ?? 0) / 100;
        $currency = strtoupper($paymentIntent['currency'] ?? 'usd');

        if (!$userId) {
            Log::warning('StripeWebhookJob: payment_intent.succeeded missing user_id', [
                'payment_intent_id' => $paymentIntentId,
            ]);
            return;
        }

        if ($type !== 'wallet_recharge') {
            Log::info('StripeWebhookJob: Received non-recharge type', [
                'type' => $type,
                'payment_intent_id' => $paymentIntentId,
            ]);
            return;
        }

        try {
            DB::transaction(function () use ($userId, $amountInDh, $paymentIntentId, $currency) {
                $wallet = Wallet::where('user_id', $userId)->lockForUpdate()->first();

                if (!$wallet) {
                    $wallet = Wallet::create([
                        'user_id' => $userId,
                        'balance' => 0.00,
                    ]);
                    $wallet->refresh();
                }

                // Double-check idempotency within the transaction
                $existingTransaction = Transaction::where('payment_intent_id', $paymentIntentId)->first();
                if ($existingTransaction) {
                    Log::info('StripeWebhookJob: Payment already processed (duplicate)', [
                        'payment_intent_id' => $paymentIntentId,
                        'transaction_id'    => $existingTransaction->id,
                        'user_id'           => $userId,
                    ]);
                    return;
                }

                $balanceBefore = (float) $wallet->balance;
                $wallet->balance = $balanceBefore + $amountInDh;
                $wallet->save();

                Transaction::create([
                    'user_id'           => $userId,
                    'type'              => 'recharge',
                    'status'            => 'completed',
                    'amount'            => $amountInDh,
                    'currency'          => $currency,
                    'balance_before'    => $balanceBefore,
                    'balance_after'     => (float) $wallet->balance,
                    'payment_method'    => 'card',
                    'payment_intent_id' => $paymentIntentId,
                    'reference'         => 'Rechargement via Stripe',
                    'metadata'          => [
                        'stripe_payment_intent' => $paymentIntentId,
                        'source'                => 'stripe_webhook_job',
                        'type'                  => 'wallet_recharge',
                    ],
                ]);

                Log::info('StripeWebhookJob: Wallet recharged successfully', [
                    'payment_intent_id' => $paymentIntentId,
                    'user_id'           => $userId,
                    'amount'            => $amountInDh,
                    'currency'          => $currency,
                    'balance_after'     => $wallet->balance,
                ]);

                // Send success notification
                $client = Client::find($userId);
                if ($client) {
                    try {
                        app(NotificationService::class)->send(
                            $client,
                            'payment',
                            'success',
                            'Recharge réussie',
                            "Votre compte a été crédité de {$amountInDh} DH. Nouveau solde : {$wallet->balance} DH.",
                            ['amount' => $amountInDh, 'new_balance' => $wallet->balance]
                        );
                    } catch (\Throwable $e) {
                        Log::warning('StripeWebhookJob: success notification skipped', [
                            'payment_intent_id' => $paymentIntentId,
                            'error'             => $e->getMessage(),
                        ]);
                    }

                    // Clear low-balance throttle and re-evaluate
                    try {
                        Redis::del("low_balance_notif:{$client->id}");
                    } catch (\Throwable $e) {
                        // Redis unavailable — non-blocking
                    }

                    event(new LowBalanceEvent($client, $wallet->balance));
                }
            }, 5); // 5 max retries on deadlock
        } catch (\Exception $e) {
            Log::error('StripeWebhookJob: Error processing payment', [
                'payment_intent_id' => $paymentIntentId,
                'user_id'           => $userId,
                'error'             => $e->getMessage(),
            ]);

            // Re-throw so the job is retried by the queue worker
            throw $e;
        }
    }
}
