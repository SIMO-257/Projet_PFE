<?php

namespace App\Console\Commands;

use App\Models\Ticket;
use App\Services\NotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendTicketExpiryReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tickets:remind-expiry
                            {--dry-run : If set, only reports what would be sent without actually sending}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send push notifications for tickets expiring within the next 24 hours';

    /**
     * Execute the console command.
     */
    public function handle(NotificationService $notificationService): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $now = now();
        $tomorrow = $now->copy()->addHours(24);

        // Find active tickets with valid_until within the next 24 hours
        $tickets = Ticket::query()
            ->where('status', 'active')
            ->whereNotNull('valid_until')
            ->where('valid_until', '>=', $now)
            ->where('valid_until', '<=', $tomorrow)
            ->with('client')
            ->get();

        if ($tickets->isEmpty()) {
            $this->info('No tickets expiring within the next 24 hours.');
            return Command::SUCCESS;
        }

        $this->info("Found {$tickets->count()} ticket(s) expiring within the next 24 hours.");

        if ($dryRun) {
            $this->warn('DRY RUN — no notifications will be sent.');
            foreach ($tickets as $ticket) {
                $this->line("  [{$ticket->id}] User {$ticket->user_id} — expires {$ticket->valid_until->diffForHumans()}");
            }
            return Command::SUCCESS;
        }

        $sent = 0;
        $skipped = 0;

        foreach ($tickets as $ticket) {
            $client = $ticket->client;

            if (!$client) {
                $skipped++;
                continue;
            }

            try {
                $notificationService->send(
                    $client,
                    'system',
                    'warning',
                    'Votre pass expire bientôt',
                    "Votre pass expire {$ticket->valid_until->diffForHumans()}.",
                    [
                        'ticket_id' => $ticket->id,
                        'ticket_uuid' => $ticket->uuid,
                        'valid_until' => $ticket->valid_until->toIso8601String(),
                    ]
                );

                $sent++;
            } catch (\Throwable $e) {
                Log::error('Failed to send expiry reminder', [
                    'ticket_id' => $ticket->id,
                    'user_id' => $ticket->user_id,
                    'error' => $e->getMessage(),
                ]);
                $skipped++;
            }
        }

        $this->info("Reminders sent: {$sent}, skipped: {$skipped}");

        Log::info('tickets:remind-expiry executed', [
            'total_tickets' => $tickets->count(),
            'sent' => $sent,
            'skipped' => $skipped,
        ]);

        return Command::SUCCESS;
    }
}
