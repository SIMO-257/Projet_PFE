<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TicketType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class AdminTicketTypeController extends Controller
{
    /**
     * List all ticket types (including inactive).
     * GET /api/admin/ticket-types
     */
    public function index()
    {
        $types = TicketType::orderBy('created_at', 'desc')->get()->map(function ($type) {
            // Decode JSON fields for the frontend
            return [
                'id'              => $type->id,
                'code'            => $type->code,
                'name'            => $this->decodeJson($type->getRawOriginal('name')),
                'description'     => $this->decodeJson($type->getRawOriginal('description')),
                'price'           => (float) $type->price,
                'student_price'   => $type->student_price !== null ? (float) $type->student_price : null,
                'duration_minutes' => $type->duration_minutes,
                'is_reusable'     => (bool) $type->is_reusable,
                'max_uses'        => $type->max_uses,
                'is_active'       => (bool) $type->is_active,
                'created_at'      => $type->created_at?->toISOString(),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $types,
        ]);
    }

    /**
     * Get a single ticket type.
     * GET /api/admin/ticket-types/{ticketType}
     */
    public function show(TicketType $ticketType)
    {
        return response()->json([
            'status' => 'success',
            'data'   => [
                'id'              => $ticketType->id,
                'code'            => $ticketType->code,
                'name'            => $this->decodeJson($ticketType->getRawOriginal('name')),
                'description'     => $this->decodeJson($ticketType->getRawOriginal('description')),
                'price'           => (float) $ticketType->price,
                'student_price'   => $ticketType->student_price !== null ? (float) $ticketType->student_price : null,
                'duration_minutes' => $ticketType->duration_minutes,
                'is_reusable'     => (bool) $ticketType->is_reusable,
                'max_uses'        => $ticketType->max_uses,
                'is_active'       => (bool) $ticketType->is_active,
                'created_at'      => $ticketType->created_at?->toISOString(),
            ],
        ]);
    }

    /**
     * Create a new ticket type.
     * POST /api/admin/ticket-types
     */
    public function store(Request $request)
    {
        $request->validate([
            'code'             => 'required|string|max:50|unique:ticket_types,code',
            'name'             => 'required|array',
            'name.fr'          => 'required|string|max:100',
            'name.en'          => 'required|string|max:100',
            'name.ar'          => 'required|string|max:100',
            'description'      => 'nullable|array',
            'price'            => 'required|numeric|min:0',
            'student_price'    => 'nullable|numeric|min:0',
            'duration_minutes' => 'nullable|integer|min:1',
            'is_reusable'      => 'boolean',
            'max_uses'         => 'integer|min:1',
            'is_active'        => 'boolean',
        ]);

        $type = TicketType::create([
            'code'             => $request->code,
            'name'             => json_encode($request->name, JSON_UNESCAPED_UNICODE),
            'description'      => $request->description ? json_encode($request->description, JSON_UNESCAPED_UNICODE) : null,
            'price'            => $request->price,
            'student_price'    => $request->student_price,
            'duration_minutes' => $request->duration_minutes,
            'is_reusable'      => $request->boolean('is_reusable', false),
            'max_uses'         => $request->input('max_uses', 1),
            'is_active'        => $request->boolean('is_active', true),
        ]);

        Log::info('Ticket type created by admin', [
            'admin_id' => $request->user()->id,
            'type_id'  => $type->id,
            'code'     => $type->code,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Type de ticket créé avec succès.',
            'data'    => $type,
        ], 201);
    }

    /**
     * Update a ticket type.
     * PUT /api/admin/ticket-types/{ticketType}
     */
    public function update(Request $request, TicketType $ticketType)
    {
        $request->validate([
            'code'             => ['required', 'string', 'max:50', Rule::unique('ticket_types', 'code')->ignore($ticketType->id)],
            'name'             => 'required|array',
            'name.fr'          => 'required|string|max:100',
            'name.en'          => 'required|string|max:100',
            'name.ar'          => 'required|string|max:100',
            'description'      => 'nullable|array',
            'price'            => 'required|numeric|min:0',
            'student_price'    => 'nullable|numeric|min:0',
            'duration_minutes' => 'nullable|integer|min:1',
            'is_reusable'      => 'boolean',
            'max_uses'         => 'integer|min:1',
            'is_active'        => 'boolean',
        ]);

        $ticketType->update([
            'code'             => $request->code,
            'name'             => json_encode($request->name, JSON_UNESCAPED_UNICODE),
            'description'      => $request->description ? json_encode($request->description, JSON_UNESCAPED_UNICODE) : null,
            'price'            => $request->price,
            'student_price'    => $request->student_price,
            'duration_minutes' => $request->duration_minutes,
            'is_reusable'      => $request->boolean('is_reusable', false),
            'max_uses'         => $request->input('max_uses', 1),
            'is_active'        => $request->boolean('is_active', true),
        ]);

        Log::info('Ticket type updated by admin', [
            'admin_id' => $request->user()->id,
            'type_id'  => $ticketType->id,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Type de ticket mis à jour avec succès.',
            'data'    => $ticketType->fresh(),
        ]);
    }

    /**
     * Toggle active status.
     * PATCH /api/admin/ticket-types/{ticketType}/toggle-status
     */
    public function toggleStatus(Request $request, TicketType $ticketType)
    {
        $ticketType->is_active = !$ticketType->is_active;
        $ticketType->save();

        Log::info('Ticket type status toggled by admin', [
            'admin_id'   => $request->user()->id,
            'type_id'    => $ticketType->id,
            'is_active'  => $ticketType->is_active,
        ]);

        return response()->json([
            'status'    => 'success',
            'message'   => $ticketType->is_active ? 'Type activé.' : 'Type désactivé.',
            'is_active' => $ticketType->is_active,
        ]);
    }

    /**
     * Delete a ticket type.
     * DELETE /api/admin/ticket-types/{ticketType}
     */
    public function destroy(Request $request, TicketType $ticketType)
    {
        $ticketType->delete();

        Log::info('Ticket type deleted by admin', [
            'admin_id' => $request->user()->id,
            'type_id'  => $ticketType->id,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Type de ticket supprimé avec succès.',
        ]);
    }

    /**
     * Safely decode JSON field for frontend consumption.
     */
    private function decodeJson($value): array
    {
        if (is_array($value)) return $value;
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            return is_array($decoded) ? $decoded : ['fr' => $value, 'en' => $value, 'ar' => $value];
        }
        return ['fr' => '', 'en' => '', 'ar' => ''];
    }
}
