<?php

namespace App\Http\Controllers;

use App\Http\Requests\TicketPurchaseRequest;
use App\Models\Ticket;
use App\Models\TicketType;
use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\AuditLog;
use App\Events\TicketPurchasedEvent;
use App\Events\LowBalanceEvent;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class TicketPurchaseController extends Controller
{
    /**
     * Purchase one or more tickets.
     */
    public function purchase(TicketPurchaseRequest $request)
    {
        $validated = $request->validated();
        $user = Auth::user();
        $ticketType = TicketType::find($validated['ticket_type_id']);

        $effectivePrice = $user->is_student && $ticketType->student_price !== null
            ? (float) $ticketType->student_price
            : (float) $ticketType->price;
        $totalPrice = $effectivePrice * $validated['quantity'];

        try {
            return DB::transaction(function () use ($totalPrice, $ticketType, $validated, $user, $effectivePrice) {
                $wallet = Wallet::where('user_id', $user->id)->lockForUpdate()->first();

                if (!$wallet) {
                    $wallet = Wallet::create([
                        'user_id' => $user->id,
                        'balance' => 0.00
                    ]);
                }

                if ($wallet->balance < $totalPrice) {
                    return $this->errorResponse('Solde insuffisant.', 422, ['balance' => ['Votre solde est insuffisant pour cet achat.']]);
                }

                $balanceBefore = $wallet->balance;
                $wallet->balance -= $totalPrice;
                $wallet->save();

                $transaction = Transaction::create([
                    'uuid' => (string) Str::uuid(),
                    'user_id' => $user->id,
                    'type' => 'purchase',
                    'status' => 'completed',
                    'amount' => $totalPrice,
                    'balance_before' => $balanceBefore,
                    'balance_after' => $wallet->balance,
                    'reference' => "Achat de {$validated['quantity']} " . ($validated['quantity'] > 1 ? 'billets' : 'billet'),
                ]);

                $tickets = [];
                $baseStartAt = now();
                $nextReusableStartAt = $baseStartAt->copy();

                if ($ticketType->is_reusable) {
                    $lastReusableTicket = Ticket::where('user_id', $user->id)
                        ->where('ticket_type_id', $ticketType->id)
                        ->whereNotNull('valid_until')
                        ->where('valid_until', '>', $baseStartAt)
                        ->orderBy('valid_until', 'desc')
                        ->lockForUpdate()
                        ->first();

                    if ($lastReusableTicket) {
                        $nextReusableStartAt = Carbon::parse($lastReusableTicket->valid_until);
                    }
                }

                for ($i = 0; $i < $validated['quantity']; $i++) {
                    $validFrom = $ticketType->is_reusable ? $nextReusableStartAt->copy() : $baseStartAt->copy();
                    $validUntil = $validFrom->copy()->addMinutes($ticketType->duration_minutes ?? 60);

                    $ticket = Ticket::create([
                        'uuid' => (string) Str::uuid(),
                        'user_id' => $user->id,
                        'ticket_type_id' => $ticketType->id,
                        'status' => 'active',
                        'valid_from' => $validFrom,
                        'valid_until' => $validUntil,
                        'remaining_uses' => $ticketType->max_uses ?? 1,
                        'price_paid' => $effectivePrice,
                    ]);
                    $tickets[] = $ticket;
                    event(new TicketPurchasedEvent($user, $ticket->id, $ticket->valid_until, $wallet->balance));

                    if ($ticketType->is_reusable) {
                        $nextReusableStartAt = $validUntil->copy();
                    }
                }

                AuditLog::log('ticket_purchase', $user->id, ['ticket_type' => $ticketType->name, 'quantity' => $validated['quantity']]);

                app(NotificationService::class)->send(
                    $user,
                    'payment',
                    'success',
                    'Confirmation d\'achat',
                    "Vous avez acheté {$validated['quantity']} " . ($validated['quantity'] > 1 ? 'billets' : 'billet') . " ({$ticketType->name}). {$totalPrice} DH débités.",
                    ['ticket_type' => $ticketType->name, 'quantity' => $validated['quantity'], 'amount' => $totalPrice]
                );

                event(new LowBalanceEvent($user, $wallet->balance));

                return $this->successResponse([
                    'tickets' => $tickets,
                    'new_balance' => $wallet->balance
                ], 'Achat réussi !', 201);
            });
        } catch (\Throwable $e) {
            Log::error('Ticket purchase failed', [
                'user_id' => $user ? $user->id : null,
                'ticket_type_id' => $validated['ticket_type_id'] ?? null,
                'quantity' => $validated['quantity'] ?? null,
                'error' => $e->getMessage(),
            ]);
            return $this->errorResponse('Une erreur est survenue lors de l\'achat.', 500);
        }
    }
}
