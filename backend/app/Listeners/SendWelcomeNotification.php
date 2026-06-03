<?php

namespace App\Listeners;

use App\Events\UserRegisteredEvent;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendWelcomeNotification implements ShouldQueue
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
    public function handle(UserRegisteredEvent $event): void
    {
        $user = $event->user;

        $this->notificationService->send(
            $user,
            'system',
            'success',
            'Bienvenue sur CodeBus !',
            "Bonjour {$user->full_name}, votre compte a été créé avec succès. Profitez de vos trajets en toute simplicité.",
            ['user_id' => $user->id]
        );
    }
}
