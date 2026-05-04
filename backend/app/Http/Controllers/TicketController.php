<?php

namespace App\Http\Controllers;

use App\Http\Requests\TicketPurchaseRequest;
use App\Models\Ticket;
use App\Models\TicketType;
use App\Models\Wallet;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Models\ValidationLog;
use Illuminate\Support\Carbon;
use App\Models\AuditLog;

class TicketController extends Controller
{
    /**
     * Get all active ticket types.
     */
    public function getTicketTypes()
    {
        $types = TicketType::where('is_active', true)->get();
        return $this->successResponse($types);
    }

    /**
     * Purchase a ticket.
     */
    public function purchase(TicketPurchaseRequest $request)
    {
        $validated = $request->validated();
        $client = Auth::user();
        $ticketType = TicketType::find($validated['ticket_type_id']);
        
        $totalPrice = $ticketType->price * $validated['quantity'];

        try {
            return DB::transaction(function () use ($totalPrice, $ticketType, $validated, $client) {
                // Get or create wallet inside transaction with lock
                $wallet = Wallet::where('user_id', $client->id)->lockForUpdate()->first();
                
                if (!$wallet) {
                    $wallet = Wallet::create([
                        'user_id' => $client->id,
                        'balance' => 0.00 // Default if missing
                    ]);
                }

                if ($wallet->balance < $totalPrice) {
                    return $this->errorResponse('Solde insuffisant.', 422, ['balance' => ['Votre solde est insuffisant pour cet achat.']]);
                }

                $balanceBefore = $wallet->balance;
                
                // 1. Deduct from wallet
                $wallet->balance -= $totalPrice;
                $wallet->save();

                // 2. Create Transaction Log
                $transaction = Transaction::create([
                    'uuid' => (string) Str::uuid(),
                    'user_id' => $client->id,
                    'type' => 'purchase',
                    'status' => 'completed',
                    'amount' => $totalPrice,
                    'balance_before' => $balanceBefore,
                    'balance_after' => $wallet->balance,
                    'reference' => "Achat de {$validated['quantity']} " . ($validated['quantity'] > 1 ? 'billets' : 'billet'),
                ]);

                // 3. Create Tickets
                $tickets = [];
                for ($i = 0; $i < $validated['quantity']; $i++) {
                    $ticket = Ticket::create([
                        'uuid' => (string) Str::uuid(),
                        'user_id' => $client->id,
                        'ticket_type_id' => $ticketType->id,
                        'status' => 'active',
                        'valid_from' => now(),
                        'valid_until' => now()->addMinutes($ticketType->duration_minutes ?? 60),
                        'remaining_uses' => $ticketType->max_uses ?? 1,
                        'price_paid' => $ticketType->price,
                    ]);
                    $tickets[] = $ticket;
                }

                AuditLog::log('ticket_purchase', $client->id, ['ticket_type' => $ticketType->name, 'quantity' => $validated['quantity']]);

                return $this->successResponse([
                    'tickets' => $tickets,
                    'new_balance' => $wallet->balance
                ], 'Achat réussi !', 201);
            });
        } catch (\Exception $e) {
            return $this->errorResponse('Une erreur est survenue lors de l\'achat.', 500);
        }
    }

    /**
     * Get ticket details.
     */
    public function show($identifier)
    {
        $client = Auth::user();

        // Find by UUID or ID, restricted to the authenticated user
        $ticket = Ticket::with('ticketType')
            ->where('user_id', $client->id)
            ->where(function ($query) use ($identifier) {
                $query->where('uuid', $identifier)
                      ->orWhere('id', $identifier);
            })
            ->first();

        if (!$ticket) {
            return $this->errorResponse('Ticket non trouvé.', 404);
        }

        return $this->successResponse($ticket);
    }

    /**
     * Get all tickets for a client.
     */
    public function index(Request $request)
    {
        $client = Auth::user();

        if (!$client) {
            return $this->errorResponse('Unauthenticated.', 401);
        }

        $tickets = Ticket::where('user_id', $client->id)
            ->with('ticketType')
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->successResponse($tickets);
    }

    /**
     * Validate a ticket.
     */
    public function validateTicket(Request $request, $uuid)
    {
        $client = Auth::user();
        $validationType = $request->input('validation_type', 'qr');
        $validatorId = $request->input('validator_id', 'DEV-001'); // Mock validator ID
        $location = $request->input('location');

        try {
            return DB::transaction(function () use ($uuid, $client, $validationType, $validatorId, $location) {
                // 1. Fetch ticket with lock to prevent race conditions
                $ticket = Ticket::where('uuid', $uuid)
                    ->where('user_id', $client->id)
                    ->lockForUpdate()
                    ->first();

                if (!$ticket) {
                    $this->logValidation(null, $client->id, $validatorId, $validationType, 'failure', 'Ticket non trouvé ou non autorisé.');
                    AuditLog::log('ticket_validation_failed_not_found', $client->id, ['uuid' => $uuid]);
                    return $this->errorResponse('Ticket non trouvé ou non autorisé.', 404);
                }

                // 2. Security & Business Rules Validation
                $failureReason = null;

                if ($ticket->status !== 'active') {
                    $failureReason = "Le billet est déjà {$ticket->status}.";
                } elseif ($ticket->remaining_uses <= 0) {
                    $failureReason = "Plus d'utilisations restantes.";
                    $ticket->status = 'used';
                    $ticket->save();
                } elseif ($ticket->valid_until && Carbon::parse($ticket->valid_until)->isPast()) {
                    $failureReason = "Le billet a expiré.";
                    $ticket->status = 'expired';
                    $ticket->save();
                }

                if ($failureReason) {
                    $this->logValidation($ticket->id, $client->id, $validatorId, $validationType, 'failure', $failureReason, $location);
                    AuditLog::log('ticket_validation_failed', $client->id, ['uuid' => $uuid, 'reason' => $failureReason]);
                    return $this->errorResponse($failureReason, 422);
                }

                // 3. Perform Validation (Decrement Use)
                $ticket->remaining_uses -= 1;
                
                if ($ticket->remaining_uses <= 0) {
                    $ticket->status = 'used';
                }
                
                $ticket->save();

                // 4. Log Success
                $this->logValidation($ticket->id, $client->id, $validatorId, $validationType, 'success', null, $location);
                AuditLog::log('ticket_validation_success', $client->id, ['uuid' => $uuid]);

                return $this->successResponse([
                    'remaining_uses' => $ticket->remaining_uses,
                    'status_after' => $ticket->status
                ], 'Billet validé avec succès.');
            });
        } catch (\Exception $e) {
            return $this->errorResponse('Une erreur est survenue lors de la validation.', 500);
        }
    }

    /**
     * Helper to log validation attempts.
     */
    private function logValidation($ticketId, $userId, $validatorId, $type, $status, $reason = null, $location = null)
    {
        ValidationLog::create([
            'ticket_id' => $ticketId,
            'user_id' => $userId,
            'validator_id' => $validatorId,
            'validation_type' => $type,
            'status' => $status,
            'failure_reason' => $reason,
            'location' => $location,
            'metadata' => [
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent()
            ]
        ]);
    }
}
