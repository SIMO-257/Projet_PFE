<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class AdminNotificationLogController extends Controller
{
    public function index(Request $request)
    {
        $query = Notification::with('user:id,full_name,email');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('body', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('email', 'like', "%{$search}%")
                         ->orWhere('full_name', 'like', "%{$search}%");
                  });
            });
        }

        $notifications = $query->orderBy('created_at', 'desc')->paginate(20);

        // Transform to include admin info from meta
        $notifications->getCollection()->transform(function ($n) {
            $meta = $n->meta ?? [];
            $n->admin_name = $meta['admin_name'] ?? null;
            $n->admin_id = $meta['admin_id'] ?? null;
            return $n;
        });

        return response()->json([
            'status' => 'success',
            'data'   => $notifications,
        ]);
    }

    public function export(Request $request)
    {
        $query = Notification::with('user:id,full_name,email');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $notifications = $query->orderBy('created_at', 'desc')->get();
        $filename = 'notification-history-' . now()->format('Y-m-d-His') . '.xls';

        return $this->csvDownload($notifications,
            ['Date', 'Type', 'Titre', 'Message', 'Utilisateur', 'Email', 'Admin', 'Lu'],
            function ($n) {
                $meta = $n->meta ?? [];
                return [
                    $n->created_at?->format('Y-m-d H:i:s'),
                    $n->type,
                    $n->title,
                    $n->body,
                    $n->user?->full_name ?? 'N/A',
                    $n->user?->email ?? '',
                    $meta['admin_name'] ?? '—',
                    $n->is_read ? 'Oui' : 'Non',
                ];
            },
            $filename
        );
    }
}
