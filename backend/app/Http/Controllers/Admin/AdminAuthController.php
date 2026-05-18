<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
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

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Identifiants incorrects.',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ce compte administrateur est désactivé.',
            ], 403);
        }

        // Revoke old tokens, issue new one
        $user->tokens()->delete();
        $token = $user->createToken('admin-token', ['role:admin'])->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Connexion réussie.',
            'token'   => $token,
            'admin'   => [
                'id'         => $user->id,
                'first_name' => $user->first_name,
                'last_name'  => $user->last_name,
                'email'      => $user->email,
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
