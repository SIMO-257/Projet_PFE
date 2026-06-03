<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendAdminNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int    $clientId,
        public string $type,
        public string $title,
        public string $body,
        public ?int   $adminId = null,
        public ?string $adminName = null,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(NotificationService $notificationService): void
    {
        $user = User::find($this->clientId);

        if (!$user) {
            Log::warning('SendAdminNotificationJob: User not found', [
                'client_id' => $this->clientId,
            ]);
            return;
        }

        $notificationService->send(
            $user,
            $this->type,
            'info',
            $this->title,
            $this->body,
            $this->adminId ? ['admin_id' => $this->adminId, 'admin_name' => $this->adminName] : [],
        );
    }
}
