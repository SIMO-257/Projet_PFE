<?php

namespace App\Http\Controllers;

use App\Http\Requests\RechargeInitRequest;
use App\Http\Requests\RechargeConfirmRequest;
use App\Models\Wallet;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\PaymentIntent;

use App\Models\AuditLog;

class WalletController extends Controller
{
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
     * Webhook remains source of truth; this method now has an idempotent fallback.
     */
    public function rechargeConfirm(RechargeConfirmRequest $request)
    {
        Stripe::setApiKey(config('services.stripe.secret'));
        try {
            $paymentIntent = PaymentIntent::retrieve($request->paymentIntentId);

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

                    $transaction = Transaction::firstOrCreate(
                        ['payment_intent_id' => $paymentIntent->id],
                        [
                            'user_id' => $user->id,
                            'type' => 'recharge',
                            'status' => 'completed',
                            'amount' => $amountInDh,
                            'currency' => strtoupper($paymentIntent->currency ?? 'MAD'),
                            'balance_before' => $balanceBefore,
                            'balance_after' => $wallet->balance,
                            'payment_method' => 'card',
                            'reference' => 'Rechargement via Stripe',
                            'metadata' => [
                                'source' => 'wallet_confirm_fallback',
                                'stripe_payment_intent' => $paymentIntent->id,
                                'type' => 'wallet_recharge',
                            ],
                        ]
                    );
                });
            }

            $wallet = Wallet::where('user_id', $user->id)->first();

            return $this->successResponse([
                'balance' => (float) ($wallet->balance ?? 0),
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
