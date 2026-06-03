<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;

class AdminAuthController extends Controller
{
    // POST /api/admin/login
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $admin = Admin::where('email', $request->email)->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            AuditLog::log('admin_login_failed', null, ['email' => $request->email, 'ip' => $request->ip()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Identifiants incorrects.',
            ], 401);
        }

        if (!$admin->is_active) {
            AuditLog::log('admin_login_failed_inactive', $admin->id, ['email' => $request->email]);
            return response()->json([
                'status' => 'error',
                'message' => 'Ce compte administrateur est désactivé.',
            ], 403);
        }

        // Revoke old tokens, issue new one
        $admin->tokens()->delete();
        $token = $admin->createToken('admin-token', ['role:admin'])->plainTextToken;

        AuditLog::log('admin_login_success', $admin->id, ['ip' => $request->ip()]);

        return response()->json([
            'status' => 'success',
            'message' => 'Connexion réussie.',
            'token'   => $token,
            'admin'   => [
                'id'                  => $admin->id,
                'first_name'          => $admin->first_name,
                'last_name'           => $admin->last_name,
                'email'               => $admin->email,
                'is_super_admin'      => $admin->is_super_admin,
                'must_change_password' => $admin->must_change_password,
            ],
        ]);
    }

    // POST /api/admin/logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json([
            'status' => 'success',
            'message' => 'Déconnecté.'
        ]);
    }

    // GET /api/admin/me
    public function me(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'admin' => $request->user()
        ]);
    }

    // POST /api/admin/force-password-reset
    public function forcePasswordReset(Request $request)
    {
        $request->validate([
            'password'              => ['required', 'confirmed', Password::min(8)],
        ]);

        /** @var \App\Models\Admin $admin */
        $admin = $request->user();

        $admin->password = Hash::make($request->password);
        $admin->must_change_password = false;
        $admin->save();

        AuditLog::log('admin_password_force_reset', $admin->id, ['ip' => $request->ip()]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Mot de passe modifié avec succès.',
            'admin'   => [
                'id'                  => $admin->id,
                'first_name'          => $admin->first_name,
                'last_name'           => $admin->last_name,
                'email'               => $admin->email,
                'is_super_admin'      => $admin->is_super_admin,
                'must_change_password' => false,
            ],
        ]);
    }
}
