<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use App\Events\TicketPurchasedEvent;
use App\Events\TicketValidatedEvent;
use App\Events\LowBalanceEvent;
use App\Events\UserRegisteredEvent;
use App\Listeners\ScheduleTicketExpiration;
use App\Listeners\SendTicketValidatedNotification;
use App\Listeners\SendLowBalanceNotification;
use App\Listeners\SendWelcomeNotification;
use App\Listeners\CreateDefaultWallet;
use App\Listeners\LogRegistrationAudit;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        TicketPurchasedEvent::class => [
            ScheduleTicketExpiration::class,
        ],
        TicketValidatedEvent::class => [
            SendTicketValidatedNotification::class,
        ],
        LowBalanceEvent::class => [
            SendLowBalanceNotification::class,
        ],
        UserRegisteredEvent::class => [
            SendWelcomeNotification::class,
            CreateDefaultWallet::class,
            LogRegistrationAudit::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
