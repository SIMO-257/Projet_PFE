<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\AuditLog;
use App\Services\TicketValidationService;
use App\Events\TicketValidatedEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class AdminValidationController extends Controller
{
    public function __construct(
        protected TicketValidationService $ticketService
    ) {}

    /**
     * Validate any user's ticket by UUID (admin only).
     * POST /api/admin/validator/validate-ticket/{uuid}
     */
    public function validateTicket(Request $request, $uuid)
    {
        /** @var \App\Models\Admin $admin */
        $admin = $request->user();
        $validatorId = $request->input('validator_id', 'ADMIN-' . $admin->id);
        $location = $request->input('location');

        // Service handles ticket lookup, validation, and logging
        $result = $this->ticketService->adminValidateTicketByUuid($uuid, $validatorId, $location);

        if (!$result['success']) {
            return $this->errorResponse($result['message'], $result['status']);
        }

        // Dispatch validation event
        if (isset($result['ticket'])) {
            event(new TicketValidatedEvent(
                $result['user'],
                $result['ticket']->id,
                6.00,
                'Tramway T1',
                $location ?? $validatorId
            ));
        }

        AuditLog::log('admin_ticket_validation_success', $admin->id, [
            'ticket_uuid' => $uuid,
            'ticket_owner' => $result['ticket']->user_id ?? null,
            'status_after' => $result['data']['status_after'] ?? null,
            'validator_id' => $validatorId,
        ]);

        return $this->successResponse($result['data'], $result['message']);
    }

    /**
     * Consume a QR validation token (admin version — allows cross-user validation).
     * POST /api/admin/validator/consume-qr
     */
    public function consumeQr(Request $request)
    {
        $validated = $request->validate([
            'validation_token' => 'required|string',
            'validator_id' => 'nullable|string',
            'location' => 'nullable|string',
        ]);

        /** @var \App\Models\Admin $admin */
        $admin = $request->user();
        $token = trim($validated['validation_token']);
        $validatorId = $validated['validator_id'] ?? 'ADMIN-' . $admin->id;
        $location = $validated['location'] ?? null;

        $payload = $this->ticketService->parseValidationToken($token);
        if (!$payload) {
            return $this->errorResponse('Token QR invalide.', 422);
        }

        $ticketUuid = trim((string) ($payload['ticket_uuid'] ?? ''));
        $exp = (int) ($payload['exp'] ?? 0);
        $jti = (string) ($payload['jti'] ?? '');

        if ($ticketUuid === '' || $exp <= 0 || $jti === '') {
            return $this->errorResponse('Token QR mal formé.', 422);
        }

        if (now()->timestamp > $exp) {
            return $this->errorResponse('Token QR expiré.', 422);
        }

        $usedJtiKey = "qr_validation_token_used:{$jti}";
        if (Cache::has($usedJtiKey)) {
            return $this->errorResponse('Token QR déjà utilisé.', 422);
        }

        Cache::put($usedJtiKey, true, now()->addSeconds(max(1, $exp - now()->timestamp)));

        // Admin validation — doesn't check token's user_id against authenticated user
        $result = $this->ticketService->adminValidateTicketByUuid($ticketUuid, $validatorId, $location);

        if (!$result['success']) {
            return $this->errorResponse($result['message'], $result['status']);
        }

        // Dispatch validation event
        if (isset($result['ticket'])) {
            event(new TicketValidatedEvent(
                $result['user'],
                $result['ticket']->id,
                6.00,
                'Tramway T1',
                $location ?? $validatorId
            ));
        }

        AuditLog::log('admin_qr_validation_success', $admin->id, [
            'ticket_uuid' => $ticketUuid,
            'ticket_owner' => $result['user']->id ?? null,
            'status_after' => $result['data']['status_after'] ?? null,
        ]);

        return $this->successResponse($result['data'], $result['message']);
    }

    /**
     * Look up a ticket by UUID to preview before validating.
     * POST /api/admin/validator/lookup
     */
    public function lookupTicket(Request $request)
    {
        $validated = $request->validate([
            'ticket_uuid' => 'required|string',
        ]);

        $ticket = Ticket::with(['ticketType', 'user'])
            ->where('uuid', trim($validated['ticket_uuid']))
            ->first();

        if (!$ticket) {
            return $this->errorResponse('Ticket non trouvé.', 404);
        }

        // Normalize ticket status
        $this->ticketService->normalizeTicketStatus($ticket);

        return $this->successResponse([
            'uuid' => $ticket->uuid,
            'status' => $ticket->status,
            'remaining_uses' => $ticket->remaining_uses,
            'valid_until' => $ticket->valid_until,
            'can_validate' => $this->ticketService->canValidateStatus((string) $ticket->status),
            'ticket_type' => $ticket->ticketType ? [
                'name' => $ticket->ticketType->name,
                'is_reusable' => $ticket->ticketType->is_reusable,
            ] : null,
            'owner' => $ticket->user ? [
                'id' => $ticket->user->id,
                'full_name' => ($ticket->user->first_name ?? '') . ' ' . ($ticket->user->last_name ?? ''),
                'email' => $ticket->user->email,
            ] : null,
        ], 'Ticket trouvé.');
    }
}
