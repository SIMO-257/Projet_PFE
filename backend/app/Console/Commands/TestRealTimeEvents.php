<?php

namespace App\Console\Commands;

use App\Events\LowBalanceEvent;
use App\Events\NewNotificationEvent;
use App\Events\TicketPurchasedEvent;
use App\Events\TicketValidatedEvent;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;

class TestRealTimeEvents extends Command
{
    protected $signature = 'test:realtime
                           {user : The user ID or email of the user to broadcast events for}';

    protected $description = 'Fire all Reverb broadcast events to test real-time WebSocket delivery. Run this while logged into the app in your browser to see [WS] console logs appear.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $identifier = $this->argument('user');

        // Resolve user by ID or email
        $user = is_numeric($identifier)
            ? User::find((int) $identifier)
            : User::where('email', $identifier)->first();

        if (! $user) {
            $this->error("User not found: {$identifier}");
            return self::FAILURE;
        }

        $this->line("Firing events for user: {$user->email} (ID: {$user->id})");
        $this->newLine();

        // ── 1. TicketPurchasedEvent → [WS] ticket.purchased ──
        $this->info('[1/4] Firing TicketPurchasedEvent...');
        event(new TicketPurchasedEvent(
            $user,
            ticketId: 99999,
            validUntil: Carbon::now()->addDay(),
            newBalance: 42.50
        ));
        $this->line('      → Wait for "[WS] ticket.purchased:" in the browser console.');
        $this->newLine();

        // ── 2. TicketValidatedEvent → [WS] ticket.validated ──
        $this->info('[2/4] Firing TicketValidatedEvent...');
        event(new TicketValidatedEvent(
            $user,
            ticketId: 88888,
            amount: 5.00,
            line: 'Ligne 1',
            stop: 'Arrêt Central'
        ));
        $this->line('      → Wait for "[WS] ticket.validated:" in the browser console.');
        $this->newLine();

        // ── 3. LowBalanceEvent → [WS] balance.updated ──
        $this->info('[3/4] Firing LowBalanceEvent...');
        event(new LowBalanceEvent(
            $user,
            balance: 3.50
        ));
        $this->line('      → Wait for "[WS] balance.updated:" in the browser console.');
        $this->newLine();

        // ── 4. NewNotificationEvent → [WS] notification.new ──
        $this->info('[4/4] Firing NewNotificationEvent...');
        event(new NewNotificationEvent(
            $user,
            notificationId: 0,  // 0 = test notification, not persisted
            type: 'system',
            title: '🔔 Test Realtime',
            body: 'Si vous voyez ce message, le WebSocket Reverb fonctionne parfaitement !',
            severity: 'success',
            meta: ['source' => 'test-realtime-command', 'test' => true]
        ));
        $this->line('      → Wait for "[WS] notification.new:" in the browser console.');
        $this->newLine();

        $this->info('✅ All events fired! Check your browser console for [WS] log messages.');
        $this->line('');
        $this->line('Tip: Open DevTools Console (F12) — look for 4 messages starting with [WS]:');
        $this->line('  • [WS] ticket.purchased:');
        $this->line('  • [WS] ticket.validated:');
        $this->line('  • [WS] balance.updated:');
        $this->line('  • [WS] notification.new:');

        return self::SUCCESS;
    }
}
