<?php

namespace App\Services;

use App\Models\Ticket;
use App\Models\TicketType;
use App\Models\User;
use App\Models\ValidationLog;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class TicketValidationService
{
    // ─── Status Helpers ──────────────────────────────────────────

    public function normalizeTicketStatus(Ticket $ticket): void
    {
        if (in_array($ticket->status, ['active', 'used']) && $this->shouldConsumeUse($ticket) && $ticket->remaining_uses <= 0) {
            $ticket->status = 'validated';
            $ticket->save();
        } elseif (in_array($ticket->status, ['active', 'used']) && !empty($ticket->valid_until) && Carbon::parse($ticket->valid_until)->isPast()) {
            $ticket->status = 'expired';
            $ticket->save();
        }
    }

    public function isTicketExpired(Ticket $ticket): bool
    {
        if ($ticket->status === 'expired') {
            return true;
        }
        return $ticket->valid_until ? Carbon::parse($ticket->valid_until)->isPast() : false;
    }

    public function shouldConsumeUse(Ticket $ticket): bool
    {
        $ticket->loadMissing('ticketType');
        return !($ticket->ticketType?->is_reusable ?? false);
    }

    public function canValidateStatus(string $status): bool
    {
        return in_array($status, ['active', 'used'], true);
    }

    // ─── Default Ticket Helpers ──────────────────────────────────

    public function resolveDefaultTicketForUser(User $user, bool $persistFallback = true): ?Ticket
    {
        $defaultTicket = null;

        $defaultTicketId = $user->getAttribute('default_ticket_id');
        if (!empty($defaultTicketId)) {
            $defaultTicket = Ticket::with('ticketType')
                ->where('id', $defaultTicketId)
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
            $user->setAttribute('default_ticket_id', $fallback ? $fallback->id : null);
            $user->save();
        }

        return $fallback;
    }

    // ─── JWT Helpers ─────────────────────────────────────────────

    public function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    public function base64UrlDecode(string $data): string|false
    {
        $padding = 4 - (strlen($data) % 4);
        if ($padding < 4) {
            $data .= str_repeat('=', $padding);
        }
        return base64_decode(strtr($data, '-_', '+/'));
    }

    public function buildValidationToken(array $payload): string
    {
        $header = ['alg' => 'HS256', 'typ' => 'JWT'];
        $headerB64 = $this->base64UrlEncode(json_encode($header, JSON_UNESCAPED_SLASHES));
        $payloadB64 = $this->base64UrlEncode(json_encode($payload, JSON_UNESCAPED_SLASHES));
        $signature = hash_hmac('sha256', "{$headerB64}.{$payloadB64}", (string) config('app.key'), true);
        $signatureB64 = $this->base64UrlEncode($signature);
        return "{$headerB64}.{$payloadB64}.{$signatureB64}";
    }

    public function parseValidationToken(string $token): ?array
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

    // ─── Admin Validation ────────────────────────────────────────

    /**
     * Validate a ticket by UUID without user_id restriction — for admin use.
     * Admins can validate any user's ticket.
     */
    public function adminValidateTicketByUuid(string $uuid, string $validatorId, ?string $location = null): array
    {
        try {
            return DB::transaction(function () use ($uuid, $validatorId, $location) {
                $ticket = Ticket::with('ticketType')
                    ->where('uuid', $uuid)
                    ->lockForUpdate()
                    ->first();

                if (!$ticket) {
                    AuditLog::log('admin_validation_failed_not_found', null, ['uuid' => $uuid]);
                    return ['success' => false, 'message' => 'Ticket non trouvé.', 'status' => 404];
                }

                $user = $ticket->user;
                if (!$user) {
                    return ['success' => false, 'message' => 'Propriétaire du ticket introuvable.', 'status' => 404];
                }

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
                    $this->logValidation($ticket->id, $user->id, $validatorId, 'qr', 'failure', $failureReason, $location);
                    AuditLog::log('admin_validation_failed', $user->id, ['uuid' => $uuid, 'reason' => $failureReason, 'validator' => $validatorId]);
                    return ['success' => false, 'message' => $failureReason, 'status' => 422];
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

                $this->logValidation($ticket->id, $user->id, $validatorId, 'qr', 'success', null, $location);
                AuditLog::log('admin_validation_success', $user->id, [
                    'uuid' => $uuid,
                    'validator' => $validatorId,
                ]);

                return [
                    'success' => true,
                    'data' => [
                        'remaining_uses' => $ticket->remaining_uses,
                        'status_after' => $ticket->status,
                    ],
                    'message' => 'Billet validé avec succès.',
                    'ticket' => $ticket,
                    'user' => $user,
                    'location' => $location,
                    'validatorId' => $validatorId,
                ];
            });
        } catch (\Throwable $e) {
            Log::error('Admin ticket validation failed', [
                'ticket_uuid' => $uuid,
                'validator_id' => $validatorId,
                'error' => $e->getMessage(),
            ]);
            return ['success' => false, 'message' => 'Une erreur est survenue lors de la validation.', 'status' => 500];
        }
    }

    // ─── Core Validation Logic ───────────────────────────────────

    /**
     * Validate a ticket by UUID — shared between direct validation and QR consumption.
     * Returns an array with 'success' bool, response data, and HTTP status.
     */
    public function validateTicketByUuid(string $uuid, User $user, string $validationType, string $validatorId, ?string $location = null): array
    {
        try {
            return DB::transaction(function () use ($uuid, $user, $validationType, $validatorId, $location) {
                $ticket = Ticket::where('uuid', $uuid)
                    ->where('user_id', $user->id)
                    ->lockForUpdate()
                    ->first();

                if (!$ticket) {
                    $this->logValidation(null, $user->id, $validatorId, $validationType, 'failure', 'Ticket non trouvé ou non autorisé.', $location);
                    AuditLog::log('ticket_validation_failed_not_found', $user->id, ['uuid' => $uuid]);
                    return ['success' => false, 'message' => 'Ticket non trouvé ou non autorisé.', 'status' => 404];
                }

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
                    return ['success' => false, 'message' => $failureReason, 'status' => 422];
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

                $this->logValidation($ticket->id, $user->id, $validatorId, $validationType, 'success', null, $location);
                AuditLog::log('ticket_validation_success', $user->id, ['uuid' => $uuid]);

                return [
                    'success' => true,
                    'data' => [
                        'remaining_uses' => $ticket->remaining_uses,
                        'status_after' => $ticket->status,
                    ],
                    'message' => 'Billet validé avec succès.',
                    'ticket' => $ticket,
                    'user' => $user,
                    'location' => $location,
                    'validatorId' => $validatorId,
                ];
            });
        } catch (\Throwable $e) {
            Log::error('Ticket validation failed', [
                'user_id' => $user ? $user->id : null,
                'ticket_uuid' => $uuid,
                'validation_type' => $validationType,
                'validator_id' => $validatorId,
                'error' => $e->getMessage(),
            ]);
            return ['success' => false, 'message' => 'Une erreur est survenue lors de la validation.', 'status' => 500];
        }
    }

    // ─── Logging ──────────────────────────────────────────────────

    public function logValidation($ticketId, $userId, $validatorId, $type, $status, $reason = null, $location = null): void
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
