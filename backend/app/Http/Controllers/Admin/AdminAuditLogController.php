<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AdminAuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::with('user:id,full_name,email');

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->date_to . ' 23:59:59');
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(30);

        $actions = AuditLog::select('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action');

        return response()->json([
            'status' => 'success',
            'data'   => $logs,
            'actions' => $actions,
        ]);
    }

    public function export(Request $request)
    {
        $query = AuditLog::with('user:id,full_name,email');

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->date_to . ' 23:59:59');
        }

        $logs = $query->orderBy('created_at', 'desc')->get();
        $filename = 'audit-logs-' . now()->format('Y-m-d-His') . '.xls';

        return $this->csvDownload($logs,
            ['Date', 'Action', 'Utilisateur', 'Email', 'IP', 'User-Agent', 'Metadonnees'],
            function ($log) {
                return [
                    $log->created_at?->format('Y-m-d H:i:s'),
                    $log->action,
                    $log->user?->full_name ?? 'N/A',
                    $log->user?->email ?? '',
                    $log->ip_address ?? '',
                    $log->user_agent ?? '',
                    $log->metadata ? json_encode($log->metadata, JSON_UNESCAPED_UNICODE) : '',
                ];
            },
            $filename
        );
    }
}
