<?php

namespace App\Http\Controllers;

use App\Http\Requests\TicketPurchaseRequest;
use App\Models\Ticket;
use App\Models\TicketType;
use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use App\Models\ValidationLog;
use Illuminate\Support\Carbon;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Log;

class TicketController extends Controller
{
    private function normalizeTicketStatus(Ticket $ticket): void
    {
        if ($ticket->status === 'active' && $ticket->remaining_uses <= 0) {
            $ticket->status = 'used';
            $ticket->save();
        }
    }

    private function isTicketExpired(Ticket $ticket): bool
    {
        return $ticket->status === 'expired';
    }

    private function resolveDefaultTicketForClient(Client $client, bool $persistFallback = true): ?Ticket
    {
        $defaultTicket = null;

        if (!empty($client->default_ticket_id)) {
            $defaultTicket = Ticket::with('ticketType')
                ->where('id', $client->default_ticket_id)
                ->where('user_id', $client->id)
                ->first();
        }

        if ($defaultTicket) {
            return $defaultTicket;
        }

        $fallback = Ticket::with('ticketType')
            ->where('user_id', $client->id)
            ->orderBy('created_at', 'desc')
            ->first();

        if ($persistFallback) {
            $client->default_ticket_id = $fallback ? $fallback->id : null;
            $client->save();
        }

        return $fallback;
    }

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
                $baseStartAt = now();
                $nextReusableStartAt = $baseStartAt->copy();

                if ($ticketType->is_reusable) {
                    $lastReusableTicket = Ticket::where('user_id', $client->id)
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
                        'user_id' => $client->id,
                        'ticket_type_id' => $ticketType->id,
                        'status' => 'active',
                        'valid_from' => $validFrom,
                        'valid_until' => $validUntil,
                        'remaining_uses' => $ticketType->max_uses ?? 1,
                        'price_paid' => $ticketType->price,
                    ]);
                    $tickets[] = $ticket;

                    if ($ticketType->is_reusable) {
                        $nextReusableStartAt = $validUntil->copy();
                    }
                }

                AuditLog::log('ticket_purchase', $client->id, ['ticket_type' => $ticketType->name, 'quantity' => $validated['quantity']]);

                // 4. Send Notification
                app(\App\Services\NotificationService::class)->send(
                    $client,
                    'payment',
                    'success',
                    'Confirmation d\'achat',
                    "Vous avez acheté {$validated['quantity']} " . ($validated['quantity'] > 1 ? 'billets' : 'billet') . " ({$ticketType->name_fr}). {$totalPrice} DH débités.",
                    ['ticket_type' => $ticketType->name, 'quantity' => $validated['quantity'], 'amount' => $totalPrice]
                );

                // Dispatch Low Balance Event
                event(new \App\Events\LowBalanceEvent($client, $wallet->balance));

                return $this->successResponse([
                    'tickets' => $tickets,
                    'new_balance' => $wallet->balance
                ], 'Achat réussi !', 201);
            });
        } catch (\Throwable $e) {
            Log::error('Ticket purchase failed', [
                'client_id' => $client ? $client->id : null,
                'ticket_type_id' => $validated['ticket_type_id'] ?? null,
                'quantity' => $validated['quantity'] ?? null,
                'error' => $e->getMessage(),
            ]);
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

    public function cards(Request $request)
    {
        $client = Auth::user();

        $activeDefault = $this->resolveDefaultTicketForClient($client, true);
        $tickets = Ticket::where('user_id', $client->id)
            ->with('ticketType')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (Ticket $ticket) use ($activeDefault) {
                $this->normalizeTicketStatus($ticket);
                $isExpired = $this->isTicketExpired($ticket);

                return [
                    'id' => $ticket->id,
                    'uuid' => $ticket->uuid,
                    'status' => $ticket->status,
                    'valid_from' => $ticket->valid_from,
                    'valid_until' => $ticket->valid_until,
                    'remaining_uses' => $ticket->remaining_uses,
                    'price_paid' => $ticket->price_paid,
                    'created_at' => $ticket->created_at,
                    'ticket_type' => $ticket->ticketType,
                    'is_expired' => $isExpired,
                    'is_default' => $activeDefault ? $activeDefault->id === $ticket->id : false,
                ];
            });

        return $this->successResponse($tickets);
    }
    public function setDefaultCard(Request $request)
    {
        $validated = $request->validate([
            'ticket_id' => 'required|integer',
        ]);

        /** @var Client $client */
        $client = Auth::user();
        $ticket = Ticket::with('ticketType')
            ->where('id', $validated['ticket_id'])
            ->where('user_id', $client->id)
            ->first();

        if (!$ticket) {
            return $this->errorResponse('Ticket non trouve ou non autorise.', 404);
        }

        $client->default_ticket_id = $ticket->id;
        $client->save();

        $ticket = Ticket::with('ticketType')->find($ticket->id);

        return $this->successResponse([
            'default_ticket_id' => $ticket->id,
            'default_ticket' => $ticket,
        ], 'Ticket par defaut mis a jour.');
    }

    /**
     * Create a short-lived NFC challenge token (60s).
     */
    public function createNfcChallenge(Request $request)
    {
        /** @var Client $client */
        $client = Auth::user();
        $token = strtoupper(Str::random(12));
        $expiresIn = 60;
        $expiresAt = now()->addSeconds($expiresIn);
        $cacheKey = "nfc_challenge:{$client->id}:{$token}";

        Cache::put($cacheKey, [
            'user_id' => $client->id,
            'expires_at' => $expiresAt->toIso8601String(),
        ], $expiresAt);

        return $this->successResponse([
            'nfc_token' => $token,
            'expires_in' => $expiresIn,
            'expires_at' => $expiresAt->toIso8601String(),
        ], 'Challenge NFC genere.');
    }

    /**
     * Consume NFC challenge and validate an active ticket by UUID.
     */
    public function consumeNfcChallenge(Request $request)
    {
        $validated = $request->validate([
            'ticket_uuid' => 'required|string',
            'nfc_token' => 'required|string',
        ]);

        /** @var Client $client */
        $client = Auth::user();
        $token = strtoupper(trim($validated['nfc_token']));
        $ticketUuid = trim($validated['ticket_uuid']);
        $cacheKey = "nfc_challenge:{$client->id}:{$token}";
        $challenge = Cache::get($cacheKey);

        if (!$challenge) {
            return $this->errorResponse('Token NFC invalide ou expire.', 422);
        }

        Cache::forget($cacheKey);

        try {
            return DB::transaction(function () use ($client, $ticketUuid) {
                $ticket = Ticket::where('uuid', $ticketUuid)
                    ->where('user_id', $client->id)
                    ->lockForUpdate()
                    ->first();

                if (!$ticket) {
                    $this->logValidation(null, $client->id, 'DEV-NFC-CHALLENGE', 'nfc', 'failure', 'Ticket non trouve.');
                    return $this->errorResponse('Ticket non trouve ou non autorise.', 404);
                }

                if ($ticket->status !== 'active') {
                    $this->logValidation($ticket->id, $client->id, 'DEV-NFC-CHALLENGE', 'nfc', 'failure', "Ticket deja {$ticket->status}.");
                    return $this->errorResponse("Le billet est deja {$ticket->status}.", 422);
                }

                $ticket->remaining_uses -= 1;

                if ($ticket->remaining_uses <= 0) {
                    $ticket->status = 'used';
                }

                $ticket->save();

                $this->logValidation($ticket->id, $client->id, 'DEV-NFC-CHALLENGE', 'nfc', 'success', null);
                AuditLog::log('ticket_validation_nfc_challenge_success', $client->id, ['uuid' => $ticket->uuid]);

                return $this->successResponse([
                    'uuid' => $ticket->uuid,
                    'remaining_uses' => $ticket->remaining_uses,
                    'status_after' => $ticket->status,
                ], 'Billet valide via NFC.');
            });
        } catch (\Throwable $e) {
            Log::error('NFC challenge consume failed', [
                'client_id' => $client ? $client->id : null,
                'ticket_uuid' => $ticketUuid,
                'error' => $e->getMessage(),
            ]);
            return $this->errorResponse('Erreur lors de la validation NFC.', 500);
        }
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

                // Dispatch Notification Event
                event(new \App\Events\TicketValidatedEvent(
                    $client,
                    $ticket->id,
                    6.00, // Fixed price for a ride in Casablanca (example)
                    'Tramway T1',
                    $location ?? $validatorId
                ));

                return $this->successResponse([
                    'remaining_uses' => $ticket->remaining_uses,
                    'status_after' => $ticket->status
                ], 'Billet validé avec succès.');
            });
        } catch (\Throwable $e) {
            Log::error('Ticket validation failed', [
                'client_id' => $client ? $client->id : null,
                'ticket_uuid' => $uuid,
                'validation_type' => $validationType,
                'validator_id' => $validatorId,
                'error' => $e->getMessage(),
            ]);
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
