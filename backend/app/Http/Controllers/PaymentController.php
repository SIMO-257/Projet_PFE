<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Illuminate\Support\Facades\Auth;
use App\Models\AuditLog;

class PaymentController extends Controller
{
    /**
     * Create a Stripe PaymentIntent for the wallet recharge system.
     */
    public function createIntent(Request $request)
    {
        $user = Auth::user();
        $stripeSecret = (string) config('services.stripe.secret');
        if ($stripeSecret === '' || str_contains($stripeSecret, 'REPLACE_ME')) {
            return $this->errorResponse('Stripe n\'est pas configure: STRIPE_SECRET manquante.', 500);
        }
        Stripe::setApiKey($stripeSecret);

        $request->validate([
            'amount' => 'required|numeric|min:5|max:500',
            'currency' => 'required|string|size:3',
        ]);

        $amountInCents = (int) ($request->amount * 100);

        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => $amountInCents,
                'currency' => strtolower($request->currency),
                'metadata' => [
                    'user_id' => $user->id,
                    'type' => 'wallet_recharge',
                ],
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            AuditLog::log('payment_intent_created', $user->id, [
                'amount' => $request->amount,
                'currency' => $request->currency,
                'pi_id' => $paymentIntent->id,
                'type' => 'wallet_recharge'
            ]);

            return $this->successResponse([
                'clientSecret' => $paymentIntent->client_secret,
                'paymentIntentId' => $paymentIntent->id,
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse('Erreur lors de la création du paiement : ' . $e->getMessage(), 500);
        }
    }
}
