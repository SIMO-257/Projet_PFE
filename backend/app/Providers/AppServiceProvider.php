<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

// Event listeners are registered in EventServiceProvider.php
use Stripe\Stripe;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Set Stripe API Key globally
        Stripe::setApiKey(config('services.stripe.secret'));

        // Login Rate Limiter: 5 attempts per minute per IP
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        // Recharge Rate Limiter: 10 requests per minute per User
        RateLimiter::for('recharge', function (Request $request) {
            return $request->user()
                ? Limit::perMinute(10)->by($request->user()->id)
                : Limit::perMinute(5)->by($request->ip());
        });

        // Validation Rate Limiter: 10 requests per minute per User
        RateLimiter::for('validation', function (Request $request) {
            return $request->user()
                ? Limit::perMinute(10)->by($request->user()->id)
                : Limit::perMinute(5)->by($request->ip());
        });
    }
}
