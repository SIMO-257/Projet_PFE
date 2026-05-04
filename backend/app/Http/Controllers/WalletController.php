<?php

namespace App\Http\Controllers;

use App\Http\Requests\RechargeInitRequest;
use App\Http\Requests\RechargeConfirmRequest;
use App\Models\Wallet;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\PaymentIntent;

use App\Models\AuditLog;

class WalletController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Initialize a wallet recharge by creating a Stripe PaymentIntent.
     */
    public function rechargeInit(RechargeInitRequest $request)
    {
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
        try {
            $paymentIntent = PaymentIntent::retrieve($request->paymentIntentId);

            if ($paymentIntent->status !== 'succeeded') {
                return $this->errorResponse('Le paiement n\'a pas été validé.', 400);
            }

            $user = Auth::user();

            // 1. HARD Ownership Check: Cross-check PI metadata against authenticated user
            if (($paymentIntent->metadata->user_id ?? null) != $user->id) {
                AuditLog::log('suspicious_payment_claim', $user->id, ['pi_id' => $paymentIntent->id, 'pi_user_id' => $paymentIntent->metadata->user_id ?? 'none']);
                return $this->errorResponse('Accès non autorisé à ce paiement.', 403);
            }

            $amount = $paymentIntent->amount / 100;

            return DB::transaction(function () use ($user, $amount, $paymentIntent) {
                // 2. Idempotency Check using unique payment_intent_id
                $existingTransaction = Transaction::where('payment_intent_id', $paymentIntent->id)->first();
                if ($existingTransaction) {
                    $wallet = Wallet::where('user_id', $user->id)->first();
                    return $this->successResponse([
                        'balance' => (float) ($wallet->balance ?? 0),
                        'card_last_four' => $wallet->card_last_four ?? '****',
                        'processed_via' => $existingTransaction->metadata['source'] ?? 'unknown'
                    ], 'Paiement déjà traité.');
                }

                // 3. Fallback processing (if webhook is slow)
                // We keep the logic but it uses the same unique constraint to prevent race conditions with webhook
                $wallet = Wallet::firstOrCreate(
                    ['user_id' => $user->id],
                    ['balance' => 0.00, 'card_last_four' => '****']
                );

                $wallet = Wallet::where('user_id', $user->id)->lockForUpdate()->first();
                $balanceBefore = $wallet->balance;
                $wallet->balance += $amount;

                $charge = $paymentIntent->latest_charge;
                if ($charge) {
                    $chargeObj = \Stripe\Charge::retrieve($charge);
                    if ($chargeObj->payment_method_details->card) {
                        $wallet->card_last_four = $chargeObj->payment_method_details->card->last4;
                    }
                }

                $wallet->save();

                Transaction::create([
                    'user_id' => $user->id,
                    'type' => 'recharge',
                    'status' => 'completed',
                    'amount' => $amount,
                    'balance_before' => $balanceBefore,
                    'balance_after' => $wallet->balance,
                    'payment_method' => 'card',
                    'reference' => 'Recharge via API',
                    'payment_intent_id' => $paymentIntent->id,
                    'metadata' => [
                        'stripe_payment_intent' => $paymentIntent->id,
                        'source' => 'api_confirmation'
                    ],
                ]);

                AuditLog::log('wallet_recharge_success', $user->id, ['amount' => $amount, 'pi_id' => $paymentIntent->id, 'source' => 'api']);

                return $this->successResponse([
                    'balance' => (float) $wallet->balance,
                    'card_last_four' => $wallet->card_last_four,
                    'processed_via' => 'api'
                ], 'Portefeuille rechargé avec succès.');
            });
        } catch (\Exception $e) {
            Log::error("Wallet Recharge Confirm Error: " . $e->getMessage());
            return $this->errorResponse('Erreur lors de la confirmation.', 500);
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
