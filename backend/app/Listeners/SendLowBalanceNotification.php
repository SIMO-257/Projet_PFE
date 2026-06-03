<?php

namespace App\Listeners;

use App\Events\LowBalanceEvent;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Redis;

class SendLowBalanceNotification implements ShouldQueue
{
    use InteractsWithQueue;

    protected $notificationService;

    /**
     * Create the event listener.
     */
    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Handle the event.
     */
    public function handle(LowBalanceEvent $event): void
    {
        $user = $event->user;

        // Only send if balance < 10 DH
        if ($event->balance >= 10) {
            return;
        }

        // Throttle: check Redis key "low_balance_notif:{user_id}" — skip if exists
        $redisKey = "low_balance_notif:{$user->id}";
        try {
            if (Redis::exists($redisKey)) {
                return;
            }
            
            // Set key with TTL 24h after sending
            Redis::setex($redisKey, 86400, '1');
        } catch (\Throwable $e) {
            // If Redis fails, we continue without throttling
        }

        $this->notificationService->send(
            $user,
            'payment',
            'warning',
            'Solde faible',
            "Votre solde est de {$event->balance} DH. Rechargez votre carte.",
            ['balance' => $event->balance]
        );
    }
}
