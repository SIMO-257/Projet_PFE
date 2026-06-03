<?php

namespace App\Listeners;

use App\Events\UserRegisteredEvent;
use App\Models\AuditLog;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class LogRegistrationAudit implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(UserRegisteredEvent $event): void
    {
        $user = $event->user;

        AuditLog::log('registration_completed', $user->id, [
            'email' => $user->email,
            'full_name' => $user->full_name,
            'registered_at' => now()->toIso8601String(),
        ]);
    }
}
