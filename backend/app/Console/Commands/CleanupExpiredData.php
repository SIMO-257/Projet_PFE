<?php

namespace App\Console\Commands;

use App\Models\AuditLog;
use App\Models\Notification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CleanupExpiredData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cleanup:expired
                            {--retention-days=90 : Number of days to keep audit logs and notifications}
                            {--dry-run : If set, only reports what would be deleted without actually deleting}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up expired/old data: audit logs, verification codes, and notifications';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $retentionDays = (int) $this->option('retention-days');
        $dryRun = (bool) $this->option('dry-run');
        $cutoff = now()->subDays($retentionDays);

        $this->info("Starting cleanup with {$retentionDays}-day retention...");
        if ($dryRun) {
            $this->warn('DRY RUN — no data will be deleted.');
        }

        $totalDeleted = 0;

        // 1. Clean old audit logs
        $totalDeleted += $this->cleanAuditLogs($cutoff, $dryRun);

        // 2. Clean expired/abandoned pending registrations (older than 24h)
        $totalDeleted += $this->cleanPendingRegistrations($dryRun);

        // 3. Clean old notification records
        $totalDeleted += $this->cleanNotifications($cutoff, $dryRun);


        $this->info("Cleanup complete. Total records affected: {$totalDeleted}");

        Log::info('CleanupExpiredData completed', [
            'retention_days' => $retentionDays,
            'total_deleted' => $totalDeleted,
            'dry_run' => $dryRun,
        ]);

        return Command::SUCCESS;
    }

    /**
     * Delete audit logs older than the cutoff date.
     */
    private function cleanAuditLogs(\Carbon\Carbon $cutoff, bool $dryRun): int
    {
        $query = AuditLog::where('created_at', '<', $cutoff);
        $count = $query->count();

        $this->line("  Audit logs older than {$cutoff->toDateString()}: {$count}");

        if (!$dryRun && $count > 0) {
            $query->delete();
        }

        return $count;
    }

    /**
     * Delete pending registrations that have expired verification codes (older than 60 minutes)
     * and were created more than 24 hours ago (abandoned registrations).
     */
    private function cleanPendingRegistrations(bool $dryRun): int
    {
        $cutoff = now()->subHours(24);

        $query = DB::table('pending_registrations')
            ->where('created_at', '<', $cutoff);

        $count = $query->count();

        $this->line("  Abandoned pending registrations (older than 24h): {$count}");

        if (!$dryRun && $count > 0) {
            $query->delete();
        }

        return $count;
    }

    /**
     * Delete notification records older than the cutoff date.
     */
    private function cleanNotifications(\Carbon\Carbon $cutoff, bool $dryRun): int
    {
        $query = Notification::where('created_at', '<', $cutoff);
        $count = $query->count();

        $this->line("  Notifications older than {$cutoff->toDateString()}: {$count}");

        if (!$dryRun && $count > 0) {
            $query->delete();
        }

        return $count;
    }
}
