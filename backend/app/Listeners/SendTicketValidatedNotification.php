<?php

namespace App\Listeners;

use App\Events\TicketValidatedEvent;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendTicketValidatedNotification implements ShouldQueue
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
    public function handle(TicketValidatedEvent $event): void
    {
        $user = $event->user;
        
        $this->notificationService->send(
            $user,
            'validation',
            'success',
            'Trajet validé',
            "{$event->amount} DH débités — {$event->line}, arrêt {$event->stop}.",
            [
                'ticket_id' => $event->ticketId,
                'amount' => $event->amount,
                'line' => $event->line,
                'stop' => $event->stop
            ]
        );
    }
}
