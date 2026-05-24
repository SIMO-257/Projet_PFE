<?php

namespace App\Jobs;

use App\Models\Client;
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
    ) {}

    /**
     * Execute the job.
     */
    public function handle(NotificationService $notificationService): void
    {
        $client = Client::find($this->clientId);

        if (!$client) {
            Log::warning('SendAdminNotificationJob: Client not found', [
                'client_id' => $this->clientId,
            ]);
            return;
        }

        $notificationService->send(
            $client,
            $this->type,
            'info',
            $this->title,
            $this->body,
        );
    }
}
