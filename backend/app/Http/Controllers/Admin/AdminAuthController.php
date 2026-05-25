<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

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
            return response()->json([
                'status' => 'error',
                'message' => 'Identifiants incorrects.',
            ], 401);
        }

        if (!$admin->is_active) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ce compte administrateur est désactivé.',
            ], 403);
        }

        // Revoke old tokens, issue new one
        $admin->tokens()->delete();
        $token = $admin->createToken('admin-token', ['role:admin'])->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Connexion réussie.',
            'token'   => $token,
            'admin'   => [
                'id'         => $admin->id,
                'first_name' => $admin->first_name,
                'last_name'  => $admin->last_name,
                'email'      => $admin->email,
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
}
