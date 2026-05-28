<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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
            'currency' => 'sometimes|string|size:3',
        ]);

        $currency = strtolower($request->currency ?? 'MAD');
        $amountInCents = (int) ($request->amount * 100);

        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => $amountInCents,
                'currency' => $currency,
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
                'currency' => $currency,
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

    /**
     * Cancel a Stripe PaymentIntent.
     */
    public function cancelIntent(Request $request)
    {
        $user = Auth::user();
        $stripeSecret = (string) config('services.stripe.secret');
        if ($stripeSecret === '' || str_contains($stripeSecret, 'REPLACE_ME')) {
            return $this->errorResponse('Stripe n\'est pas configure: STRIPE_SECRET manquante.', 500);
        }
        Stripe::setApiKey($stripeSecret);

        $request->validate([
            'payment_intent_id' => 'required|string',
        ]);

        try {
            $paymentIntent = PaymentIntent::retrieve($request->payment_intent_id);

            // Verify ownership
            $metadataUserId = $paymentIntent->metadata->user_id ?? null;
            if ((string) $metadataUserId !== (string) $user->id) {
                return $this->errorResponse('Accès non autorisé.', 403);
            }

            // Only cancel if it hasn't succeeded yet
            if ($paymentIntent->status === 'succeeded') {
                return $this->errorResponse('Impossible d\'annuler un paiement déjà confirmé.', 400);
            }

            if ($paymentIntent->status === 'canceled') {
                return $this->successResponse(null, 'Le paiement est déjà annulé.');
            }

            $paymentIntent->cancel();

            AuditLog::log('payment_intent_cancelled', $user->id, [
                'pi_id' => $request->payment_intent_id,
            ]);

            Log::info('PaymentIntent cancelled by user', [
                'payment_intent_id' => $request->payment_intent_id,
                'user_id' => $user->id,
            ]);

            return $this->successResponse(null, 'Paiement annulé avec succès.');
        } catch (\Exception $e) {
            Log::error('Failed to cancel PaymentIntent', [
                'payment_intent_id' => $request->payment_intent_id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            return $this->errorResponse('Erreur lors de l\'annulation du paiement.', 500);
        }
    }
}
