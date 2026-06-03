<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;

class AdminManagementController extends Controller
{
    /**
     * Ensure the current user is a super admin.
     */
    private function requireSuperAdmin(Request $request): ?\Illuminate\Http\JsonResponse
    {
        /** @var \App\Models\Admin $currentAdmin */
        $currentAdmin = $request->user();

        if (!$currentAdmin->is_super_admin) {
            return response()->json([
                'status' => 'error',
                'message' => 'Accès refusé. Seul le super administrateur peut gérer les comptes administrateurs.',
            ], 403);
        }

        return null;
    }

    /**
     * List all admins.
     * GET /api/admin/admins
     */
    public function index(Request $request)
    {
        $forbidden = $this->requireSuperAdmin($request);
        if ($forbidden) return $forbidden;

        $admins = Admin::select('id', 'first_name', 'last_name', 'email', 'is_active', 'is_super_admin', 'created_at')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'status' => 'success',
            'admins' => $admins,
        ]);
    }

    /**
     * Get a single admin (any admin can view basic info).
     * GET /api/admin/admins/{admin}
     */
    public function show(Request $request, Admin $admin)
    {
        return response()->json([
            'status' => 'success',
            'admin' => $admin->only(['id', 'first_name', 'last_name', 'email', 'is_active', 'is_super_admin', 'created_at']),
        ]);
    }

    /**
     * Create a new admin (super admin only).
     * POST /api/admin/admins
     */
    public function store(Request $request)
    {
        $forbidden = $this->requireSuperAdmin($request);
        if ($forbidden) return $forbidden;

        $request->validate([
            'first_name' => 'required|string|max:50',
            'last_name'  => 'required|string|max:50',
            'email'      => 'required|email|unique:admins,email',
            'password'   => ['required', 'confirmed', Password::min(8)],
        ]);

        $admin = Admin::create([
            'first_name'           => $request->first_name,
            'last_name'            => $request->last_name,
            'email'                => $request->email,
            'password'             => Hash::make($request->password),
            'is_active'            => true,
            'is_super_admin'       => false,
            'must_change_password' => true,
        ]);

        Log::info('New admin created by super admin', [
            'creator_id'  => $request->user()->id,
            'new_admin_id' => $admin->id,
            'email'       => $admin->email,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Administrateur créé avec succès.',
            'admin' => $admin->only(['id', 'first_name', 'last_name', 'email', 'is_active', 'is_super_admin', 'created_at']),
        ], 201);
    }

    /**
     * Update an admin.
     * PUT /api/admin/admins/{admin}
     */
    public function update(Request $request, Admin $admin)
    {
        $forbidden = $this->requireSuperAdmin($request);
        if ($forbidden) return $forbidden;

        // Cannot modify yourself via this endpoint
        if ($request->user()->id === $admin->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Utilisez la page profil pour modifier votre propre compte.',
            ], 422);
        }

        $request->validate([
            'first_name' => 'sometimes|string|max:50',
            'last_name'  => 'sometimes|string|max:50',
            'email'      => 'sometimes|email|unique:admins,email,' . $admin->id,
            'is_active'  => 'sometimes|boolean',
        ]);

        $admin->update($request->only(['first_name', 'last_name', 'email', 'is_active']));

        Log::info('Admin updated by super admin', [
            'updater_id' => $request->user()->id,
            'admin_id'   => $admin->id,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Administrateur mis à jour avec succès.',
            'admin' => $admin->fresh()->only(['id', 'first_name', 'last_name', 'email', 'is_active', 'is_super_admin', 'created_at']),
        ]);
    }

    /**
     * Toggle admin active status.
     * PATCH /api/admin/admins/{admin}/toggle-status
     */
    public function toggleStatus(Request $request, Admin $admin)
    {
        $forbidden = $this->requireSuperAdmin($request);
        if ($forbidden) return $forbidden;

        // Prevent deactivating yourself
        if ($request->user()->id === $admin->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous ne pouvez pas désactiver votre propre compte.',
            ], 422);
        }

        // Prevent deactivating another super admin
        if ($admin->is_super_admin && $admin->id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous ne pouvez pas désactiver un autre super administrateur.',
            ], 422);
        }

        $admin->is_active = !$admin->is_active;
        $admin->save();

        Log::info('Admin status toggled by super admin', [
            'updater_id' => $request->user()->id,
            'admin_id'   => $admin->id,
            'new_status' => $admin->is_active,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => $admin->is_active ? 'Compte activé.' : 'Compte désactivé.',
            'is_active' => $admin->is_active,
        ]);
    }

    /**
     * Simple delete (legacy — no password check, super admin only).
     * DELETE /api/admin/admins/{admin}
     */
    public function destroy(Request $request, Admin $admin)
    {
        $forbidden = $this->requireSuperAdmin($request);
        if ($forbidden) return $forbidden;

        if ($request->user()->id === $admin->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous ne pouvez pas supprimer votre propre compte.',
            ], 422);
        }

        if ($admin->is_super_admin) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous ne pouvez pas supprimer un autre super administrateur.',
            ], 422);
        }

        $admin->delete();

        Log::info('Admin deleted by super admin (DELETE)', [
            'deleter_id' => $request->user()->id,
            'deleted_admin_id' => $admin->id,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Administrateur supprimé avec succès.',
        ]);
    }

    /**
     * Delete an admin with password confirmation.
     * POST /api/admin/admins/{admin}/delete
     */
    public function destroyWithPassword(Request $request, Admin $admin)
    {
        $forbidden = $this->requireSuperAdmin($request);
        if ($forbidden) return $forbidden;

        if ($request->user()->id === $admin->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous ne pouvez pas supprimer votre propre compte.',
            ], 422);
        }

        if ($admin->is_super_admin) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous ne pouvez pas supprimer un autre super administrateur.',
            ], 422);
        }

        $request->validate([
            'password' => 'required|string',
        ]);

        /** @var \App\Models\Admin $currentAdmin */
        $currentAdmin = $request->user();

        if (!Hash::check($request->password, $currentAdmin->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Mot de passe incorrect. La suppression est annulée.',
            ], 403);
        }

        $admin->delete();

        Log::info('Admin deleted by super admin', [
            'deleter_id' => $request->user()->id,
            'deleted_admin_id' => $admin->id,
            'deleted_email' => $admin->email,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Administrateur supprimé avec succès.',
        ]);
    }
}
