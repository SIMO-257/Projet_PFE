<?php

namespace App\Http\Controllers;

use App\Http\Requests\RechargeInitRequest;
use App\Http\Requests\RechargeConfirmRequest;
use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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
        Stripe::setApiKey(config('services.stripe.secret'));
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
        Stripe::setApiKey(config('services.stripe.secret'));
        try {
            $paymentIntent = PaymentIntent::retrieve($request->paymentIntentId);

            if ($paymentIntent->status === 'requires_payment_method' || $paymentIntent->status === 'canceled') {
                $errorMessage = $paymentIntent->last_payment_error ? $paymentIntent->last_payment_error->message : 'Le paiement a été refusé.';
                
                app(\App\Services\NotificationService::class)->send(
                    Auth::user(),
                    'payment',
                    'danger',
                    'Paiement refusé',
                    "Votre tentative de rechargement a échoué : {$errorMessage}",
                    ['payment_intent' => $paymentIntent->id]
                );

                return $this->errorResponse($errorMessage, 422);
            }

            if ($paymentIntent->status !== 'succeeded') {
                return $this->errorResponse('Le paiement n\'a pas encore ete valide par Stripe.', 400);
            }

            $user = Auth::user();

            // 1. Ownership Check
            if (($paymentIntent->metadata->user_id ?? null) != $user->id) {
                return $this->errorResponse('Acces non autorise.', 403);
            }

            // 2. Check if already processed (typically by webhook)
            $transaction = Transaction::where('payment_intent_id', $paymentIntent->id)->first();

            // 3. Fallback processing when webhook is delayed
            if (!$transaction) {
                DB::transaction(function () use ($user, $paymentIntent, &$transaction) {
                    $existing = Transaction::where('payment_intent_id', $paymentIntent->id)
                        ->lockForUpdate()
                        ->first();

                    if ($existing) {
                        $transaction = $existing;
                        return;
                    }

                    $wallet = Wallet::where('user_id', $user->id)->lockForUpdate()->first();
                    if (!$wallet) {
                        $wallet = Wallet::create([
                            'user_id' => $user->id,
                            'balance' => 0.00,
                            'card_last_four' => '****',
                        ]);
                    }

                    $amountInDh = ((int) $paymentIntent->amount) / 100;

                    $balanceBefore = $wallet->balance;
                    $wallet->balance += $amountInDh;
                    $wallet->save();

                    $transaction = Transaction::create([
                        'user_id' => $user->id,
                        'type' => 'recharge',
                        'status' => 'completed',
                        'amount' => $amountInDh,
                        'balance_before' => $balanceBefore,
                        'balance_after' => $wallet->balance,
                        'payment_intent_id' => $paymentIntent->id,
                        'reference' => 'Rechargement via Stripe',
                    ]);

                    // Send Notification
                    app(\App\Services\NotificationService::class)->send(
                        $user,
                        'payment',
                        'success',
                        'Recharge réussie',
                        "Votre compte a été crédité de {$amountInDh} DH.",
                        ['amount' => $amountInDh, 'new_balance' => $wallet->balance]
                    );
                });
            }

            $wallet = Wallet::where('user_id', $user->id)->first();

            return $this->successResponse([
                'balance' => (float) ($wallet?->balance ?? 0),
                'status' => 'succeeded',
                'processed' => !!$transaction,
            ], 'Paiement confirme et traite.');

        } catch (\Exception $e) {
            Log::error('Wallet Recharge Confirm Error: ' . $e->getMessage());
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
            ['balance' => 0.00, 'card_last_four' => '****']
        );

        return $this->successResponse([
            'balance' => (float) $wallet->balance,
            'card_last_four' => $wallet->card_last_four,
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
