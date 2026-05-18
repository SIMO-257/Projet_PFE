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
        
        if ($validUntil->isFuture()) {
            // Laravel automatically calculates the seconds between 'now' and $validUntil
            ExpireTicketIfEligibleJob::dispatch($event->ticketId)->delay($validUntil);
        } else {
            ExpireTicketIfEligibleJob::dispatch($event->ticketId);
        }
    }
}
