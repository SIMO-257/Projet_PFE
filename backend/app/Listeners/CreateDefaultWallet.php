<?php

namespace App\Listeners;

use App\Events\UserRegisteredEvent;
use App\Models\Wallet;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class CreateDefaultWallet implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(UserRegisteredEvent $event): void
    {
        $user = $event->user;

        try {
            // Only create if no wallet exists yet
            Wallet::firstOrCreate(
                ['user_id' => $user->id],
                ['balance' => 0.00]
            );

            Log::info('Default wallet created for user', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to create default wallet', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
