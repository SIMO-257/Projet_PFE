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
use App\Models\Ticket;
use Illuminate\Support\Carbon;

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
     * Note: This is now a "wait and verify" check. The webhook is the source of truth for balance updates.
     */
    public function rechargeConfirm(RechargeConfirmRequest $request)
    {
        Stripe::setApiKey(config('services.stripe.secret'));
        try {
            $paymentIntent = PaymentIntent::retrieve($request->paymentIntentId);

            if ($paymentIntent->status !== 'succeeded') {
                return $this->errorResponse('Le paiement n\'a pas encore été validé par Stripe.', 400);
            }

            $user = Auth::user();

            // 1. Ownership Check
            if (($paymentIntent->metadata->user_id ?? null) != $user->id) {
                return $this->errorResponse('Accès non autorisé.', 403);
            }

            // 2. Check if webhook has already processed it
            $transaction = Transaction::where('payment_intent_id', $paymentIntent->id)->first();
            
            $wallet = Wallet::where('user_id', $user->id)->first();

            return $this->successResponse([
                'balance' => (float) ($wallet->balance ?? 0),
                'status' => 'succeeded',
                'processed' => !!$transaction
            ], $transaction ? 'Paiement confirmé et traité.' : 'Paiement réussi, mise à jour du solde en cours.');

        } catch (\Exception $e) {
            Log::error("Wallet Recharge Confirm Error: " . $e->getMessage());
            return $this->errorResponse('Erreur lors de la vérification.', 500);
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

        $activeTicket = $this->resolveDefaultTicketForUser($user);

        return $this->successResponse([
            'balance' => (float) $wallet->balance,
            'card_last_four' => $wallet->card_last_four,
            'active_ticket' => $activeTicket ? [
                'id' => $activeTicket->id,
                'uuid' => $activeTicket->uuid,
                'status' => $activeTicket->status,
                'valid_until' => $activeTicket->valid_until,
                'remaining_uses' => $activeTicket->remaining_uses,
                'price_paid' => $activeTicket->price_paid,
                'ticket_type' => $activeTicket->ticketType,
            ] : null,
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
