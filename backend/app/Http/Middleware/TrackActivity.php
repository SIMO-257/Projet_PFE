<?php

namespace App\Http\Middleware;

use App\Models\Client;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Client|null $client */
        $client = $request->user();

        if ($client) {
            $sessionLifetime = (int) config('session.lifetime', 120);
            $threshold = now()->subMinutes($sessionLifetime);

            if ($client->last_active_at && $client->last_active_at->lt($threshold)) {
                $client->is_active = false;
                $client->last_active_at = null;
                $client->save();

                if ($client->currentAccessToken()) {
                    $client->currentAccessToken()->delete();
                }

                return response()->json(['message' => 'Session expired due to inactivity.'], 401);
            } else {
                $client->last_active_at = now();
            }

            $client->save();
        }

        return $next($request);
    }
}
