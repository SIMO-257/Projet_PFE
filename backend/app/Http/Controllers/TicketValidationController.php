<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\AuditLog;
use App\Services\TicketValidationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;

class TicketValidationController extends Controller
{
    public function __construct(
        protected TicketValidationService $ticketService
    ) {}

    /**
     * Create a short-lived NFC challenge token (60s).
     */
    public function createNfcChallenge(Request $request)
    {
        /** @var \App\Models\User $user */
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
        ], 'Challenge NFC généré.');
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

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $token = strtoupper(trim($validated['nfc_token']));
        $ticketUuid = trim($validated['ticket_uuid']);
        $cacheKey = "nfc_challenge:{$user->id}:{$token}";
        $challenge = Cache::get($cacheKey);

        if (!$challenge) {
            return $this->errorResponse('Token NFC invalide ou expiré.', 422);
        }

        Cache::forget($cacheKey);

        try {
            return DB::transaction(function () use ($user, $ticketUuid) {
                $ticket = Ticket::where('uuid', $ticketUuid)
                    ->where('user_id', $user->id)
                    ->lockForUpdate()
                    ->first();

                if (!$ticket) {
                    $this->ticketService->logValidation(null, $user->id, 'DEV-NFC-CHALLENGE', 'nfc', 'failure', 'Ticket non trouvé.');
                    return $this->errorResponse('Ticket non trouvé ou non autorisé.', 404);
                }

                if (!$this->ticketService->canValidateStatus((string) $ticket->status)) {
                    $this->ticketService->logValidation($ticket->id, $user->id, 'DEV-NFC-CHALLENGE', 'nfc', 'failure', "Ticket déjà {$ticket->status}.");
                    return $this->errorResponse("Le billet est déjà {$ticket->status}.", 422);
                }

                if (!empty($ticket->valid_until) && Carbon::parse($ticket->valid_until)->isPast()) {
                    $ticket->status = 'expired';
                    $ticket->save();
                    $this->ticketService->logValidation($ticket->id, $user->id, 'DEV-NFC-CHALLENGE', 'nfc', 'failure', 'Le billet est expiré.');
                    return $this->errorResponse('Le billet est expiré.', 422);
                }

                if ($ticket->status === 'active') {
                    $ticket->status = 'used';
                }

                if ($this->ticketService->shouldConsumeUse($ticket)) {
                    $ticket->remaining_uses -= 1;
                    if ($ticket->remaining_uses <= 0) {
                        $ticket->status = 'validated';
                    }
                }

                $ticket->save();

                $this->ticketService->logValidation($ticket->id, $user->id, 'DEV-NFC-CHALLENGE', 'nfc', 'success', null);
                AuditLog::log('ticket_validation_nfc_challenge_success', $user->id, ['uuid' => $ticket->uuid]);

                return $this->successResponse([
                    'remaining_uses' => $ticket->remaining_uses,
                    'status_after' => $ticket->status,
                ], 'Billet validé via NFC.');
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
     * Create a short-lived signed QR validation token (5 minutes).
     */
    public function createQrValidationToken(Request $request)
    {
        $validated = $request->validate([
            'ticket_uuid' => 'required|string',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $ticketUuid = trim($validated['ticket_uuid']);

        $ticket = Ticket::where('uuid', $ticketUuid)
            ->where('user_id', $user->id)
            ->first();

        if (!$ticket) {
            return $this->errorResponse('Ticket non trouvé ou non autorisé.', 404);
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

        $token = $this->ticketService->buildValidationToken($payload);

        return $this->successResponse([
            'validation_token' => $token,
            'expires_in' => 300,
            'expires_at' => date(DATE_ATOM, $expiresAt),
            'ticket_uuid' => $ticket->uuid,
        ], 'Token QR généré.');
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

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $token = trim($validated['validation_token']);
        $validatorId = $validated['validator_id'] ?? 'PC-VALIDATOR-01';
        $location = $validated['location'] ?? null;

        $payload = $this->ticketService->parseValidationToken($token);
        if (!$payload) {
            $this->ticketService->logValidation(null, $user->id, $validatorId, 'qr', 'failure', 'Token QR invalide.', $location);
            return $this->errorResponse('Token QR invalide.', 422);
        }

        $ticketUuid = trim((string) ($payload['ticket_uuid'] ?? ''));
        $exp = (int) ($payload['exp'] ?? 0);
        $jti = (string) ($payload['jti'] ?? '');
        $tokenUserId = (int) ($payload['user_id'] ?? 0);

        if ($ticketUuid === '' || $exp <= 0 || $jti === '') {
            $this->ticketService->logValidation(null, $user->id, $validatorId, 'qr', 'failure', 'Token QR mal formé.', $location);
            return $this->errorResponse('Token QR mal formé.', 422);
        }

        if ($tokenUserId !== (int) $user->id) {
            $this->ticketService->logValidation(null, $user->id, $validatorId, 'qr', 'failure', 'Token QR non autorisé.', $location);
            return $this->errorResponse('Token QR non autorisé.', 403);
        }

        if (now()->timestamp > $exp) {
            $this->ticketService->logValidation(null, $user->id, $validatorId, 'qr', 'failure', 'Token QR expiré.', $location);
            return $this->errorResponse('Token QR expiré.', 422);
        }

        $usedJtiKey = "qr_validation_token_used:{$jti}";
        if (Cache::has($usedJtiKey)) {
            $this->ticketService->logValidation(null, $user->id, $validatorId, 'qr', 'failure', 'Token QR déjà utilisé.', $location);
            return $this->errorResponse('Token QR déjà utilisé.', 422);
        }

        Cache::put($usedJtiKey, true, now()->addSeconds(max(1, $exp - now()->timestamp)));

        $result = $this->ticketService->validateTicketByUuid($ticketUuid, $user, 'qr', $validatorId, $location);

        if (!$result['success']) {
            return $this->errorResponse($result['message'], $result['status']);
        }

        return $this->successResponse($result['data'], $result['message']);
    }

    /**
     * Validate a ticket by UUID directly.
     */
    public function validateTicket(Request $request, $uuid)
    {
        $user = Auth::user();
        $validationType = $request->input('validation_type', 'qr');
        $validatorId = $request->input('validator_id', 'DEV-001');
        $location = $request->input('location');

        $result = $this->ticketService->validateTicketByUuid($uuid, $user, $validationType, $validatorId, $location);

        if (!$result['success']) {
            return $this->errorResponse($result['message'], $result['status']);
        }

        return $this->successResponse($result['data'], $result['message']);
    }
}
