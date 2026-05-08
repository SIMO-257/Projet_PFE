<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schedule;
use App\Models\Ticket;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('tickets:expire', function () {
    $expiredCount = Ticket::query()
        ->where('status', 'active')
        ->whereNotNull('valid_until')
        ->where('valid_until', '<=', now())
        ->update(['status' => 'expired']);

    $this->info("Tickets expires: {$expiredCount}");
    Log::info('tickets:expire executed', ['expired_count' => $expiredCount]);
})->purpose('Mark active tickets as expired when valid_until is reached');

Schedule::command('tickets:expire')->everyMinute();
