<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Illuminate\Support\Facades\Auth;
use App\Models\AuditLog;
use App\Models\BillingDetail;

class PaymentController extends Controller
{
    /**
     * Create a Stripe PaymentIntent for the wallet recharge system.
     */
    public function createIntent(Request $request)
    {
        $user = Auth::user();
        Stripe::setApiKey(config('services.stripe.secret'));

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

    /**
     * Save or update user billing details from the Address Element.
     */
    public function saveBillingDetails(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'address' => 'required|array',
            'tax_id' => 'nullable|string|max:50',
            'country' => 'required|string|size:2',
        ]);

        $billing = BillingDetail::updateOrCreate(
            ['user_id' => $user->id],
            [
                'address' => $validated['address'],
                'tax_id' => $validated['tax_id'],
                'country' => $validated['country'],
            ]
        );

        return $this->successResponse($billing, 'Détails de facturation enregistrés.');
    }
}
