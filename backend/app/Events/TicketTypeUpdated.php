<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TicketTypeUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $ticketTypeId,
        public bool $isActive
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel('ticket-types');
    }

    public function broadcastAs(): string
    {
        return 'ticket-type.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'ticket_type_id' => $this->ticketTypeId,
            'is_active' => $this->isActive,
        ];
    }
}
