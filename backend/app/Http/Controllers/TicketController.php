<?php

namespace App\Http\Controllers;

use App\Http\Requests\TicketPurchaseRequest;
use App\Models\Ticket;
use App\Models\TicketType;
use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use App\Models\ValidationLog;
use Illuminate\Support\Carbon;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Log;
use App\Events\TicketPurchasedEvent;

class TicketController extends Controller
{
    private function normalizeTicketStatus(Ticket $ticket): void
    {
        if (in_array($ticket->status, ['active', 'used']) && $this->shouldConsumeUse($ticket) && $ticket->remaining_uses <= 0) {
            $ticket->status = 'validated';
            $ticket->save();
        } elseif (in_array($ticket->status, ['active', 'used']) && !empty($ticket->valid_until) && Carbon::parse($ticket->valid_until)->isPast()) {
            $ticket->status = 'expired';
            $ticket->save();
        }
    }

    private function isTicketExpired(Ticket $ticket): bool
    {
        return $ticket->status === 'expired';
    }

    private function shouldConsumeUse(Ticket $ticket): bool
    {
        $ticket->loadMissing('ticketType');
        return !($ticket->ticketType?->is_reusable ?? false);
    }

    private function canValidateStatus(string $status): bool
    {
        return in_array($status, ['active', 'used'], true);
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $data): string|false
    {
        $padding = 4 - (strlen($data) % 4);
        if ($padding < 4) {
            $data .= str_repeat('=', $padding);
        }
        return base64_decode(strtr($data, '-_', '+/'));
    }

    private function buildValidationToken(array $payload): string
    {
        $header = ['alg' => 'HS256', 'typ' => 'JWT'];
        $headerB64 = $this->base64UrlEncode(json_encode($header, JSON_UNESCAPED_SLASHES));
        $payloadB64 = $this->base64UrlEncode(json_encode($payload, JSON_UNESCAPED_SLASHES));
        $signature = hash_hmac('sha256', "{$headerB64}.{$payloadB64}", (string) config('app.key'), true);
        $signatureB64 = $this->base64UrlEncode($signature);
        return "{$headerB64}.{$payloadB64}.{$signatureB64}";
    }

    private function parseValidationToken(string $token): ?array
    {
        $parts = explode('.', trim($token));
        if (count($parts) !== 3) {
            return null;
        }

        [$headerB64, $payloadB64, $signatureB64] = $parts;
        $expected = $this->base64UrlEncode(
            hash_hmac('sha256', "{$headerB64}.{$payloadB64}", (string) config('app.key'), true)
        );

        if (!hash_equals($expected, $signatureB64)) {
            return null;
        }

        $payloadRaw = $this->base64UrlDecode($payloadB64);
        if ($payloadRaw === false) {
            return null;
        }

        $payload = json_decode($payloadRaw, true);
        return is_array($payload) ? $payload : null;
    }

    private function resolveDefaultTicketForUser(User $user, bool $persistFallback = true): ?Ticket
    {
        $defaultTicket = null;

        if (!empty($user->default_ticket_id)) {
            $defaultTicket = Ticket::with('ticketType')
                ->where('id', $user->default_ticket_id)
                ->where('user_id', $user->id)
                ->first();

            if ($defaultTicket) {
                $this->normalizeTicketStatus($defaultTicket);
                if ($defaultTicket->status === 'expired') {
                    $defaultTicket = null;
                }
            }
        }

        if ($defaultTicket) {
            return $defaultTicket;
        }

        $fallback = Ticket::with('ticketType')
            ->where('user_id', $user->id)
            ->where('status', '!=', 'expired')
            ->orderBy('created_at', 'desc')
            ->first();

        if ($persistFallback) {
            $user->default_ticket_id = $fallback ? $fallback->id : null;
            $user->save();
        }

        return $fallback;
    }

    /**
     * Get all active ticket types.
     */
    public function getTicketTypes()
    {
        $user = Auth::user();
        $types = TicketType::where('is_active', true)->get()->map(function ($type) use ($user) {
            $isStudent = $user && $user->is_student;
            $type->effective_price = $isStudent && $type->student_price !== null
                ? (float) $type->student_price
                : (float) $type->price;
            return $type;
        });
        return $this->successResponse($types);
    }

    /**
     * Purchase a ticket.
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
            return DB::transaction(function () use ($totalPrice, $ticketType, $validated, $user) {
                // Get or create wallet inside transaction with lock
                $wallet = Wallet::where('user_id', $user->id)->lockForUpdate()->first();
                
                if (!$wallet) {
                    $wallet = Wallet::create([
                        'user_id' => $user->id,
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
                    'user_id' => $user->id,
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
                    event(new TicketPurchasedEvent($ticket->id, $ticket->valid_until));

                    if ($ticketType->is_reusable) {
                        $nextReusableStartAt = $validUntil->copy();
                    }
                }

                AuditLog::log('ticket_purchase', $user->id, ['ticket_type' => $ticketType->name, 'quantity' => $validated['quantity']]);

                // 4. Send Notification
                app(\App\Services\NotificationService::class)->send(
                    $user,
                    'payment',
                    'success',
                    'Confirmation d\'achat',
                    "Vous avez acheté {$validated['quantity']} " . ($validated['quantity'] > 1 ? 'billets' : 'billet') . " ({$ticketType->name}). {$totalPrice} DH débités.",
                    ['ticket_type' => $ticketType->name, 'quantity' => $validated['quantity'], 'amount' => $totalPrice]
                );

                // Dispatch Low Balance Event
                event(new \App\Events\LowBalanceEvent($user, $wallet->balance));

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

    /**
     * Get ticket details.
     */
    public function show($identifier)
    {
        $user = Auth::user();

        // Find by UUID or ID, restricted to the authenticated user
        $ticket = Ticket::with('ticketType')
            ->where('user_id', $user->id)
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
     * Get all tickets for a user.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return $this->errorResponse('Unauthenticated.', 401);
        }

        $tickets = Ticket::where('user_id', $user->id)
            ->with('ticketType')
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->successResponse($tickets);
    }

    public function cards(Request $request)
    {
        $user = Auth::user();

        $activeDefault = $this->resolveDefaultTicketForUser($user, true);
        $tickets = Ticket::where('user_id', $user->id)
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

        /** @var User $user */
        $user = Auth::user();
        $ticket = Ticket::with('ticketType')
            ->where('id', $validated['ticket_id'])
            ->where('user_id', $user->id)
            ->first();

        if (!$ticket) {
            return $this->errorResponse('Ticket non trouve ou non autorise.', 404);
        }

        $user->default_ticket_id = $ticket->id;
        $user->save();

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
        /** @var User $user */
        $user = Auth::user();
        $token = strtoupper(Str::random(12));
        $expiresIn = 60;
        $expiresAt = now()->addSeconds($expiresIn);
        $cacheKey = "nfc_challenge:{$user->id}:{$token}";

        Cache::put($cacheKey, [
            'user_id' => $user->id,
            'expires_at' => $expiresAt->toIso8601String(),
        ], $expiresAt);

        return $this->successResponse([
            'nfc_token' => $token,
            'expires_in' => $expiresIn,
            'expires_at' => $expiresAt->toIso8601String(),
        ], 'Challenge NFC genere.');
    }

    /**
     * Create a short-lived signed QR validation token (5 minutes).
     */
    public function createQrValidationToken(Request $request)
    {
        $validated = $request->validate([
            'ticket_uuid' => 'required|string',
        ]);

        /** @var User $user */
        $user = Auth::user();
        $ticketUuid = trim($validated['ticket_uuid']);

        $ticket = Ticket::where('uuid', $ticketUuid)
            ->where('user_id', $user->id)
            ->first();

        if (!$ticket) {
            return $this->errorResponse('Ticket non trouve ou non autorise.', 404);
        }

        $issuedAt = now()->timestamp;
        $expiresAt = now()->addMinutes(5)->timestamp;
        $jti = (string) Str::uuid();

        $payload = [
            'sub' => 'ticket_validation',
            'ticket_uuid' => $ticket->uuid,
            'user_id' => $user->id,
            'iat' => $issuedAt,
            'exp' => $expiresAt,
            'jti' => $jti,
            'validation_type' => 'qr',
        ];

        $token = $this->buildValidationToken($payload);

        return $this->successResponse([
            'validation_token' => $token,
            'expires_in' => 300,
            'expires_at' => date(DATE_ATOM, $expiresAt),
            'ticket_uuid' => $ticket->uuid,
        ], 'Token QR genere.');
    }

    /**
     * Consume a signed QR validation token and validate ticket.
     */
    public function consumeQrValidationToken(Request $request)
    {
        $validated = $request->validate([
            'validation_token' => 'required|string',
            'validator_id' => 'nullable|string',
            'location' => 'nullable|string',
        ]);

        /** @var User $user */
        $user = Auth::user();
        $token = trim($validated['validation_token']);
        $validatorId = $validated['validator_id'] ?? 'PC-VALIDATOR-01';
        $location = $validated['location'] ?? null;

        $payload = $this->parseValidationToken($token);
        if (!$payload) {
            $this->logValidation(null, $user->id, $validatorId, 'qr', 'failure', 'Token QR invalide.', $location);
            return $this->errorResponse('Token QR invalide.', 422);
        }

        $ticketUuid = trim((string) ($payload['ticket_uuid'] ?? ''));
        $exp = (int) ($payload['exp'] ?? 0);
        $jti = (string) ($payload['jti'] ?? '');
        $tokenUserId = (int) ($payload['user_id'] ?? 0);

        if ($ticketUuid === '' || $exp <= 0 || $jti === '') {
            $this->logValidation(null, $user->id, $validatorId, 'qr', 'failure', 'Token QR mal forme.', $location);
            return $this->errorResponse('Token QR mal forme.', 422);
        }

        if ($tokenUserId !== (int) $user->id) {
            $this->logValidation(null, $user->id, $validatorId, 'qr', 'failure', 'Token QR non autorise.', $location);
            return $this->errorResponse('Token QR non autorise.', 403);
        }

        if (now()->timestamp > $exp) {
            $this->logValidation(null, $user->id, $validatorId, 'qr', 'failure', 'Token QR expire.', $location);
            return $this->errorResponse('Token QR expire.', 422);
        }

        $usedJtiKey = "qr_validation_token_used:{$jti}";
        if (Cache::has($usedJtiKey)) {
            $this->logValidation(null, $user->id, $validatorId, 'qr', 'failure', 'Token QR deja utilise.', $location);
            return $this->errorResponse('Token QR deja utilise.', 422);
        }

        Cache::put($usedJtiKey, true, now()->addSeconds(max(1, $exp - now()->timestamp)));

        return $this->validateTicketByUuid($ticketUuid, $user, 'qr', $validatorId, $location);
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

        /** @var User $user */
        $user = Auth::user();
        $token = strtoupper(trim($validated['nfc_token']));
        $ticketUuid = trim($validated['ticket_uuid']);
        $cacheKey = "nfc_challenge:{$user->id}:{$token}";
        $challenge = Cache::get($cacheKey);

        if (!$challenge) {
            return $this->errorResponse('Token NFC invalide ou expire.', 422);
        }

        Cache::forget($cacheKey);

        try {
            return DB::transaction(function () use ($user, $ticketUuid) {
                $ticket = Ticket::where('uuid', $ticketUuid)
                    ->where('user_id', $user->id)
                    ->lockForUpdate()
                    ->first();

                if (!$ticket) {
                    $this->logValidation(null, $user->id, 'DEV-NFC-CHALLENGE', 'nfc', 'failure', 'Ticket non trouve.');
                    return $this->errorResponse('Ticket non trouve ou non autorise.', 404);
                }

                if (!$this->canValidateStatus((string) $ticket->status)) {
                    $this->logValidation($ticket->id, $user->id, 'DEV-NFC-CHALLENGE', 'nfc', 'failure', "Ticket deja {$ticket->status}.");
                    return $this->errorResponse("Le billet est deja {$ticket->status}.", 422);
                }

                if (!empty($ticket->valid_until) && Carbon::parse($ticket->valid_until)->isPast()) {
                    $ticket->status = 'expired';
                    $ticket->save();
                    $this->logValidation($ticket->id, $user->id, 'DEV-NFC-CHALLENGE', 'nfc', 'failure', "Le billet est expire.");
                    return $this->errorResponse("Le billet est expire.", 422);
                }

                if ($ticket->status === 'active') {
                    $ticket->status = 'used';
                }

                if ($this->shouldConsumeUse($ticket)) {
                    $ticket->remaining_uses -= 1;

                    if ($ticket->remaining_uses <= 0) {
                        $ticket->status = 'validated';
                    }
                }

                $ticket->save();

                $this->logValidation($ticket->id, $user->id, 'DEV-NFC-CHALLENGE', 'nfc', 'success', null);
                AuditLog::log('ticket_validation_nfc_challenge_success', $user->id, ['uuid' => $ticket->uuid]);

                return $this->successResponse([
                    'uuid' => $ticket->uuid,
                    'remaining_uses' => $ticket->remaining_uses,
                    'status_after' => $ticket->status,
                ], 'Billet valide via NFC.');
            });
        } catch (\Throwable $e) {
            Log::error('NFC challenge consume failed', [
                'user_id' => $user ? $user->id : null,
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
        $user = Auth::user();
        $validationType = $request->input('validation_type', 'qr');
        $validatorId = $request->input('validator_id', 'DEV-001'); // Mock validator ID
        $location = $request->input('location');

        return $this->validateTicketByUuid($uuid, $user, $validationType, $validatorId, $location);
    }

    private function validateTicketByUuid(string $uuid, User $user, string $validationType, string $validatorId, ?string $location = null)
    {
        try {
            return DB::transaction(function () use ($uuid, $user, $validationType, $validatorId, $location) {
                // 1. Fetch ticket with lock to prevent race conditions
                $ticket = Ticket::where('uuid', $uuid)
                    ->where('user_id', $user->id)
                    ->lockForUpdate()
                    ->first();

                if (!$ticket) {
                    $this->logValidation(null, $user->id, $validatorId, $validationType, 'failure', 'Ticket non trouvé ou non autorisé.');
                    AuditLog::log('ticket_validation_failed_not_found', $user->id, ['uuid' => $uuid]);
                    return $this->errorResponse('Ticket non trouvé ou non autorisé.', 404);
                }

                // 2. Security & Business Rules Validation
                $failureReason = null;

                if (!$this->canValidateStatus((string) $ticket->status)) {
                    $failureReason = "Le billet est déjà {$ticket->status}.";
                } elseif (!empty($ticket->valid_until) && Carbon::parse($ticket->valid_until)->isPast()) {
                    $failureReason = "Le billet est expiré.";
                    $ticket->status = 'expired';
                    $ticket->save();
                } elseif ($this->shouldConsumeUse($ticket) && $ticket->remaining_uses <= 0) {
                    $failureReason = "Plus d'utilisations restantes.";
                    $ticket->status = 'validated';
                    $ticket->save();
                }

                if ($failureReason) {
                    $this->logValidation($ticket->id, $user->id, $validatorId, $validationType, 'failure', $failureReason, $location);
                    AuditLog::log('ticket_validation_failed', $user->id, ['uuid' => $uuid, 'reason' => $failureReason]);
                    return $this->errorResponse($failureReason, 422);
                }

                // 3. Perform Validation (Decrement Use)
                if ($ticket->status === 'active') {
                    $ticket->status = 'used';
                }

                if ($this->shouldConsumeUse($ticket)) {
                    $ticket->remaining_uses -= 1;
                    
                    if ($ticket->remaining_uses <= 0) {
                        $ticket->status = 'validated';
                    }
                }
                
                $ticket->save();

                // 4. Log Success
                $this->logValidation($ticket->id, $user->id, $validatorId, $validationType, 'success', null, $location);
                AuditLog::log('ticket_validation_success', $user->id, ['uuid' => $uuid]);

                // Dispatch Notification Event
                event(new \App\Events\TicketValidatedEvent(
                    $user,
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
                'user_id' => $user ? $user->id : null,
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
