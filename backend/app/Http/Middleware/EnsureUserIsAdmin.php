<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        
        \Illuminate\Support\Facades\Log::info('Admin middleware check', [
            'user_type' => $user ? get_class($user) : 'null',
            'user_id' => $user ? $user->id : 'null',
            'url' => $request->fullUrl()
        ]);

        // Check that the authenticated model is a User (admin), not a Client
        if (!($user instanceof \App\Models\User)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Accès refusé. Espace réservé aux administrateurs.'
            ], 403);
        }

        if (!$user->is_active) {
            return response()->json([
                'status' => 'error',
                'message' => 'Compte administrateur désactivé.'
            ], 403);
        }

        return $next($request);
    }
}
