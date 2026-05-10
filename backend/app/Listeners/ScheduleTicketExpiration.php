<?php

namespace App\Listeners;

use App\Events\TicketPurchasedEvent;
use App\Jobs\ExpireTicketIfEligibleJob;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Carbon;

class ScheduleTicketExpiration
{
    /**
     * Handle the event.
     */
    public function handle(TicketPurchasedEvent $event): void
    {
        $validUntil = Carbon::parse($event->validUntil);
        $delay = now()->diffInSeconds($validUntil, false);

        if ($delay > 0) {
            ExpireTicketIfEligibleJob::dispatch($event->ticketId)->delay($delay);
        } else {
            ExpireTicketIfEligibleJob::dispatch($event->ticketId);
        }
    }
}
