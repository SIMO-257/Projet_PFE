<?php

namespace App\Http\Controllers;

use App\Http\Requests\RechargeInitRequest;
use App\Http\Requests\RechargeConfirmRequest;
use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use App\Models\AuditLog;
use Carbon\Carbon;

class WalletController extends Controller
{

    private function isTicketExpired(Ticket $ticket): bool
    {
        if ($ticket->status === 'expired') {
            return true;
        }

        return $ticket->valid_until ? Carbon::parse($ticket->valid_until)->isPast() : false;
    }

    private function resolveDefaultTicketForUser($user): ?Ticket
    {
        $defaultTicket = null;
        if (!empty($user->default_ticket_id)) {
            $defaultTicket = Ticket::with('ticketType')
                ->where('id', $user->default_ticket_id)
                ->where('user_id', $user->id)
                ->first();
        }

        if ($defaultTicket) {
            return $defaultTicket;
        }

        $fallback = Ticket::with('ticketType')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->first();

        $user->default_ticket_id = $fallback?->id;
        $user->save();

        return $fallback;
    }

    /**
     * Initialize a wallet recharge by creating a Stripe PaymentIntent.
     */
    public function rechargeInit(RechargeInitRequest $request)
    {
        $stripeSecret = (string) config('services.stripe.secret');
        if ($stripeSecret === '' || str_contains($stripeSecret, 'REPLACE_ME')) {
            return $this->errorResponse('Stripe n\'est pas configure: STRIPE_SECRET manquante.', 500);
        }
        Stripe::setApiKey($stripeSecret);
        $user = Auth::user();
        $amount = (int) ($request->amount * 100); // Amount in cents for Stripe

        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => $amount,
                'currency' => 'mad',
                'metadata' => [
                    'user_id' => $user->id,
                    'type' => 'wallet_recharge',
                ],
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            AuditLog::log('wallet_recharge_init', $user->id, ['amount' => $request->amount, 'pi_id' => $paymentIntent->id]);

            return $this->successResponse([
                'clientSecret' => $paymentIntent->client_secret,
                'paymentIntentId' => $paymentIntent->id,
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse('Erreur lors de l\'initialisation du paiement.', 500);
        }
    }

    /**
     * Confirm the wallet recharge after successful Stripe payment.
     */
        public function rechargeConfirm(RechargeConfirmRequest $request)
    {
        $stripeSecret = (string) config('services.stripe.secret');
        if ($stripeSecret === '' || str_contains($stripeSecret, 'REPLACE_ME')) {
            return $this->errorResponse('Stripe n\'est pas configure: STRIPE_SECRET manquante.', 500);
        }
        Stripe::setApiKey($stripeSecret);
        try {
            $paymentIntent = PaymentIntent::retrieve($request->paymentIntentId);

            if ($paymentIntent->status === 'requires_payment_method' || $paymentIntent->status === 'canceled') {
                $errorMessage = $paymentIntent->last_payment_error ? $paymentIntent->last_payment_error->message : 'Le paiement a ete refuse.';

                try {
                    app(\App\Services\NotificationService::class)->send(
                        Auth::user(),
                        'payment',
                        'danger',
                        'Paiement refuse',
                        "Votre tentative de rechargement a echoue : {$errorMessage}",
                        ['payment_intent' => $paymentIntent->id]
                    );
                } catch (\Throwable $notificationError) {
                    Log::warning('Wallet Confirm: failure notification skipped', [
                        'payment_intent_id' => $paymentIntent->id ?? null,
                        'error' => $notificationError->getMessage(),
                    ]);
                }

                return $this->errorResponse($errorMessage, 422);
            }

            if ($paymentIntent->status !== 'succeeded') {
                return $this->errorResponse('Le paiement n\'a pas encore ete valide par Stripe.', 400);
            }

            $user = Auth::user();
            if (($paymentIntent->metadata->user_id ?? null) != $user->id) {
                return $this->errorResponse('Acces non autorise.', 403);
            }

            $transaction = null;
            DB::transaction(function () use ($user, $paymentIntent, &$transaction) {
                $wallet = Wallet::where('user_id', $user->id)->lockForUpdate()->first();
                if (!$wallet) {
                    $wallet = Wallet::create([
                        'user_id' => $user->id,
                        'balance' => 0.00,
                    ]);
                    $wallet->refresh();
                }

                $hasPaymentIntentColumn = Schema::hasColumn('transactions', 'payment_intent_id');
                $existing = $hasPaymentIntentColumn
                    ? Transaction::where('payment_intent_id', $paymentIntent->id)->first()
                    : null;
                if ($existing) {
                    $transaction = $existing;
                    Log::info("Wallet Confirm: existing transaction reused for {$paymentIntent->id}", [
                        'transaction_id' => $existing->id,
                        'user_id' => $user->id,
                    ]);
                    return;
                }

                $amountInDh = ((int) $paymentIntent->amount) / 100;
                $balanceBefore = (float) $wallet->balance;
                $wallet->balance = $balanceBefore + $amountInDh;
                $wallet->save();

                $transactionData = [
                    'user_id' => $user->id,
                    'type' => 'recharge',
                    'status' => 'completed',
                    'amount' => $amountInDh,
                    'currency' => strtoupper($paymentIntent->currency ?? 'MAD'),
                    'balance_before' => $balanceBefore,
                    'balance_after' => (float) $wallet->balance,
                    'payment_method' => 'card',
                    'reference' => 'Rechargement via Stripe',
                    'metadata' => [
                        'source' => 'wallet_confirm_fallback',
                        'stripe_payment_intent' => $paymentIntent->id,
                        'type' => 'wallet_recharge',
                    ],
                ];

                if ($hasPaymentIntentColumn) {
                    $transactionData['payment_intent_id'] = $paymentIntent->id;
                }

                $transaction = Transaction::create($transactionData);

                Log::info("Wallet Confirm: transaction created for {$paymentIntent->id}", [
                    'transaction_id' => $transaction->id,
                    'user_id' => $user->id,
                ]);

                try {
                    app(\App\Services\NotificationService::class)->send(
                        $user,
                        'payment',
                        'success',
                        'Recharge reussie',
                        "Votre compte a ete credite de {$amountInDh} DH.",
                        ['amount' => $amountInDh, 'new_balance' => $wallet->balance]
                    );
                } catch (\Throwable $notificationError) {
                    Log::warning('Wallet Confirm: success notification skipped', [
                        'payment_intent_id' => $paymentIntent->id ?? null,
                        'error' => $notificationError->getMessage(),
                    ]);
                }
            });

            $wallet = Wallet::where('user_id', $user->id)->first();

            return $this->successResponse([
                'balance' => (float) ($wallet?->balance ?? 0),
                'status' => 'succeeded',
                'processed' => !!$transaction,
                'transaction_id' => $transaction?->id,
            ], 'Paiement confirme et traite.');

        } catch (\Exception $e) {
            Log::error('Wallet Recharge Confirm Error: ' . $e->getMessage(), [
                'payment_intent_id' => $request->paymentIntentId ?? null,
                'user_id' => Auth::id(),
            ]);
            return $this->errorResponse('Erreur lors de la verification.', 500);
        }
    }
    /**
     * Get wallet details for the authenticated user.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $wallet = Wallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0.00]
        );

        return $this->successResponse([
            'balance' => (float) $wallet->balance,
        ]);
    }

    /**
     * Get transaction history for the authenticated user.
     */
    public function transactions(Request $request)
    {
        $user = Auth::user();
        $transactions = Transaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get();

        return $this->successResponse($transactions);
    }
}
