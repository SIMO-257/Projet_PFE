<?php

namespace App\Http\Controllers;

use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redis;

class NotificationController extends Controller
{
    /**
     * GET /api/v1/notifications
     * Query params: ?type=all|validation|payment|security|promo|system&page=1
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $type = $request->query('type', 'all');

        $notifications = Notification::where('user_id', $user->id)
            ->ofType($type)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        $unreadCount = $this->getUnreadCountForUser($user->id);

        return $this->successResponse([
            'notifications' => NotificationResource::collection($notifications)->response()->getData(true),
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * GET /api/v1/notifications/unread-count
     */
    public function unreadCount()
    {
        $userId = Auth::id();
        $count = $this->getUnreadCountForUser($userId);

        return $this->successResponse(['count' => (int) $count]);
    }

    /**
     * PATCH /api/v1/notifications/{id}/read
     */
    public function markRead(string $id)
    {
        $notification = Notification::where('user_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();

        if (!$notification->is_read) {
            $notification->markRead();
            $this->invalidateUnreadCache(Auth::id());
        }

        return $this->successResponse(new NotificationResource($notification), 'Notification marquée comme lue.');
    }

    /**
     * PATCH /api/v1/notifications/read-all
     */
    public function markAllRead()
    {
        Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        $this->invalidateUnreadCache(Auth::id());

        return $this->successResponse(null, 'Toutes les notifications ont été marquées comme lues.');
    }

    /**
     * DELETE /api/v1/notifications/{id}
     */
    public function destroy(string $id)
    {
        $notification = Notification::where('user_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();

        $notification->delete();
        $this->invalidateUnreadCache(Auth::id());

        return $this->successResponse(null, 'Notification supprimée.');
    }

    /**
     * POST /api/v1/notifications/log-failure
     * Allows the frontend to log a specific failure (like Stripe decline) as a notification.
     */
    public function logFailure(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string',
            'title' => 'required|string',
            'body' => 'required|string',
            'meta' => 'nullable|array',
        ]);

        $notification = Notification::create([
            'user_id' => Auth::id(),
            'type' => $validated['type'],
            'severity' => 'danger',
            'title' => $validated['title'],
            'body' => $validated['body'],
            'meta' => $validated['meta'],
        ]);

        $this->invalidateUnreadCache(Auth::id());

        return $this->successResponse(new NotificationResource($notification), 'Échec enregistré.');
    }

    private function getUnreadCountForUser($userId)
    {
        $cacheKey = 'notif_unread:' . $userId;
        
        try {
            $count = Redis::get($cacheKey);
            if ($count === null) {
                $count = Notification::where('user_id', $userId)->unread()->count();
                Redis::setex($cacheKey, 60, $count);
            }
            return $count;
        } catch (\Throwable $e) {
            // Fallback if Redis is not available
            return Notification::where('user_id', $userId)->unread()->count();
        }
    }

    private function invalidateUnreadCache($userId): void
    {
        try {
            Redis::del('notif_unread:' . $userId);
        } catch (\Throwable $e) {
            // Ignore Redis failures
        }
    }
}
