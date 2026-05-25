<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Create a notification record + fire FCM push
     */
    public function send(
        User $user,
        string $type,
        string $severity,
        string $title,
        string $body,
        array  $meta = []
    ): ?Notification {
        // Check user preferences
        $prefs = $user->notification_prefs ?? [
            'validation' => true,
            'payment' => true,
            'security' => true,
            'promo' => false,
        ];

        if (isset($prefs[$type]) && $prefs[$type] === false) {
            Log::info("Notification suppressed by user preference", [
                'user_id' => $user->id,
                'type' => $type,
                'title' => $title
            ]);
            return null;
        }

        try {
            $notif = Notification::create([
                'user_id'  => $user->id,
                'type'     => $type,
                'severity' => $severity,
                'title'    => $title,
                'body'     => $body,
                'meta'     => $meta,
            ]);
        } catch (\Throwable $e) {
            Log::error('Notification persistence failed', [
                'user_id' => $user->id,
                'type' => $type,
                'error' => $e->getMessage(),
            ]);
            return null;
        }

        $this->invalidateUnreadCache($user->id);
        $this->sendFcmPush($user, $title, $body, ['type' => $type, 'severity' => $severity]);

        return $notif;
    }

    /**
     * FCM v1 HTTP push — silently fails if no token
     */
    private function sendFcmPush(User $user, string $title, string $body, array $data = []): void
    {
        if (!$user->fcm_token) return;

        try {
            Http::withToken(config('services.fcm.server_key'))
                ->post('https://fcm.googleapis.com/fcm/send', [
                    'to' => $user->fcm_token,
                    'notification' => [
                        'title' => $title,
                        'body' => $body
                    ],
                    'data' => $data,
                ]);
        } catch (\Throwable $e) {
            Log::error("FCM Push Error: " . $e->getMessage());
        }
    }

    public function invalidateUnreadCache(int $userId): void
    {
        try {
            Redis::del("notif_unread:{$userId}");
        } catch (\Throwable $e) {
            // Ignore Redis failures
        }
    }
}
