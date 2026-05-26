<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var User|null $user */
        $user = $request->user();

        if ($user) {
            $sessionLifetime = (int) config('session.lifetime', 120);
            $threshold = now()->subMinutes($sessionLifetime);

            if ($user->last_active_at && $user->last_active_at->lt($threshold)) {
                $user->is_active = false;
                $user->last_active_at = null;
                $user->save();

                if ($user->currentAccessToken()) {
                    $user->currentAccessToken()->delete();
                }

                return response()->json(['message' => 'Session expired due to inactivity.'], 401);
            } else {
                $user->last_active_at = now();
            }

            $user->save();
        }

        return $next($request);
    }
}
