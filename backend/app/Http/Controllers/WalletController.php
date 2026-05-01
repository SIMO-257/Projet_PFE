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

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
                'paymentIntentId' => $paymentIntent->id,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'initialisation du paiement.',
                'error' => $e->getMessage()
            ], 500);
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
                return response()->json([
                    'message' => 'Le paiement n\'a pas été validé.',
                    'status' => $paymentIntent->status
                ], 400);
            }

            $user = Auth::user();
            $amount = $paymentIntent->amount / 100; // Convert back to DH

            return DB::transaction(function () use ($user, $amount, $paymentIntent) {
                $wallet = Wallet::firstOrCreate(
                    ['user_id' => $user->id],
                    ['balance' => 0.00, 'card_last_four' => '4729']
                );

                $wallet = Wallet::where('user_id', $user->id)->lockForUpdate()->first();
                $balanceBefore = $wallet->balance;
                $wallet->balance += $amount;

                // Update card info from Stripe if available
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
                    'reference' => 'Rechargement via Stripe',
                    'metadata' => ['stripe_payment_intent' => $paymentIntent->id],
                ]);

                return response()->json([
                    'message' => 'Portefeuille rechargé avec succès.',
                    'balance' => (float) $wallet->balance,
                    'card_last_four' => $wallet->card_last_four,
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la confirmation du paiement.',
                'error' => $e->getMessage()
            ], 500);
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
            ['balance' => 0.00, 'card_last_four' => '4729'] // Default mock if new
        );

        return response()->json([
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

        return response()->json($transactions);
    }
}
