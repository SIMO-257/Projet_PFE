<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * Reads the X-Locale header (sent by the frontend) and sets the application
     * locale accordingly. Falls back to 'fr' if no valid locale is provided.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->header('X-Locale', 'fr');

        $supported = ['fr', 'en', 'ar'];

        if (in_array($locale, $supported, true)) {
            app()->setLocale($locale);
        } else {
            app()->setLocale('fr');
        }

        return $next($request);
    }
}
