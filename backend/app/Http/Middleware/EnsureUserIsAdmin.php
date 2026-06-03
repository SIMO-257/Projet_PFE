<?php

namespace App\Http\Middleware;

use App\Models\Admin;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        
        Log::info('Admin middleware check', [
            'user_type' => $user ? get_class($user) : 'null',
            'user_id' => $user ? $user->id : 'null',
            'url' => $request->fullUrl()
        ]);

        // Check that the authenticated model is an Admin, not a regular User
        if (!($user instanceof Admin)) {
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

        // If admin must change password, only allow force-password-reset and logout routes
        if ($user->must_change_password) {
            $currentPath = trim($request->path(), '/');

            // $request->path() returns something like "api/admin/force-password-reset"
            $isAllowed = str_contains($currentPath, 'force-password-reset')
                      || str_contains($currentPath, 'logout');

            if (!$isAllowed) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Vous devez changer votre mot de passe avant d\'accéder à cette page.',
                    'must_change_password' => true,
                ], 403);
            }
        }

        return $next($request);
    }
}
