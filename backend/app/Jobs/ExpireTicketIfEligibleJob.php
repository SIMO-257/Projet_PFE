<?php

namespace App\Jobs;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ExpireTicketIfEligibleJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $ticketId;

    public function __construct(int $ticketId)
    {
        $this->ticketId = $ticketId;
    }

    public function handle(): void
    {
        $ticket = Ticket::find($this->ticketId);

        if (!$ticket) {
            Log::info('Ticket expiration skipped: ticket not found', ['ticket_id' => $this->ticketId]);
            return;
        }

        if ($ticket->status !== 'active') {
            Log::info('Ticket expiration skipped: status not active', [
                'ticket_id' => $ticket->id,
                'status' => $ticket->status,
            ]);
            return;
        }

        if ((int) $ticket->remaining_uses === 0) {
            Log::info('Ticket expiration skipped: remaining uses is 0', ['ticket_id' => $ticket->id]);
            return;
        }

        if (!$ticket->valid_until || $ticket->valid_until->isFuture()) {
            Log::info('Ticket expiration skipped: valid_until not reached', [
                'ticket_id' => $ticket->id,
                'valid_until' => optional($ticket->valid_until)->toDateTimeString(),
            ]);
            return;
        }

        $ticket->status = 'expired';
        $ticket->save();

        Log::info('Ticket auto-expired by delayed job', [
            'ticket_id' => $ticket->id,
            'valid_until' => optional($ticket->valid_until)->toDateTimeString(),
            'remaining_uses' => $ticket->remaining_uses,
        ]);
    }
}
