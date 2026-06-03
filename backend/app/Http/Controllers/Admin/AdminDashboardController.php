<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Ticket;
use App\Models\Transaction;
use App\Models\ValidationLog;
use App\Models\Repport;
use App\Models\StudentVerification;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    // GET /api/admin/dashboard
    public function index(Request $request)
    {
        // Optional period filter for preference analytics (defaults to all time)
        $prefDays = (int) ($request->query('pref_days', 0));

        // Scope for users within the preference period
        $prefUserQuery = User::query();
        if ($prefDays > 0) {
            $prefUserQuery->where('created_at', '>=', now()->subDays($prefDays));
        }

        // ── User preferences analytics (aggregated from the JSON column) ──
        $totalUsers = (clone $prefUserQuery)->count();

        $analyticsEnabled  = (clone $prefUserQuery)->whereRaw("COALESCE(JSON_EXTRACT(user_preferences, '$.analytics_enabled'), true) = true")->count();
        $analyticsDisabled = $totalUsers - $analyticsEnabled;

        $authPurchase        = (clone $prefUserQuery)->whereRaw("COALESCE(JSON_EXTRACT(user_preferences, '$.auth_purchase'), false) = true")->count();
        $authPurchaseDisabled = $totalUsers - $authPurchase;

        $notifValidation = (clone $prefUserQuery)->whereRaw("COALESCE(JSON_EXTRACT(notification_prefs, '$.validation'), true) = true")->count();
        $notifPayment    = (clone $prefUserQuery)->whereRaw("COALESCE(JSON_EXTRACT(notification_prefs, '$.payment'), true) = true")->count();
        $notifSecurity   = (clone $prefUserQuery)->whereRaw("COALESCE(JSON_EXTRACT(notification_prefs, '$.security'), true) = true")->count();
        $notifPromo      = (clone $prefUserQuery)->whereRaw("COALESCE(JSON_EXTRACT(notification_prefs, '$.promo'), false) = true")->count();

        $preferencesAnalytics = [
            'total_users'             => $totalUsers,
            'analytics_enabled'       => $analyticsEnabled,
            'analytics_disabled'      => $analyticsDisabled,
            'auth_purchase_enabled'   => $authPurchase,
            'auth_purchase_disabled'  => $authPurchaseDisabled,
            'notif_validation'        => $notifValidation,
            'notif_payment'           => $notifPayment,
            'notif_security'          => $notifSecurity,
            'notif_promo'             => $notifPromo,
            'period_days'             => $prefDays,
        ];

        $stats = [
            'total_clients'      => User::count(),
            'active_clients'     => User::where('is_active', true)->count(),
            'total_tickets'      => Ticket::count(),
            'validated_tickets'  => Ticket::where('status', 'used')->count(),
            'total_revenue'      => Transaction::where('type', 'recharge')->where('status', 'completed')->sum('amount'),
            'transactions_today' => Transaction::whereDate('created_at', today())->count(),
            'new_clients_today'  => User::whereDate('created_at', today())->count(),
            'revenue_today'      => Transaction::where('type', 'recharge')->where('status', 'completed')->whereDate('created_at', today())->sum('amount'),
            'total_logs'         => AuditLog::count(),
        ];

        // Chart data — last 30 days (daily revenue + tickets sold)
        $chartData = collect(range(29, 0))->map(function ($daysAgo) {
            $date = now()->subDays($daysAgo)->format('Y-m-d');
            $revenue = Transaction::where('type', 'recharge')
                ->where('status', 'completed')
                ->whereDate('created_at', $date)
                ->sum('amount');
            $ticketsSold = Ticket::whereDate('created_at', $date)->count();
            return [
                'date'         => $date,
                'revenue'      => (float) $revenue,
                'tickets_sold' => $ticketsSold,
            ];
        });

        // Recent transactions (last 10)
        $recentTransactions = Transaction::with('user:id,full_name,email')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(function ($tx) {
                return [
                    'id'          => $tx->id,
                    'uuid'        => $tx->uuid,
                    'user_name'   => $tx->user?->full_name ?? 'N/A',
                    'user_email'  => $tx->user?->email ?? '',
                    'type'        => $tx->type,
                    'amount'      => (float) $tx->amount,
                    'status'      => $tx->status,
                    'created_at'  => $tx->created_at->toISOString(),
                ];
            });

        // Pending counts for quick links
        $pendingReportsCount   = Repport::where('statut', 'en attente')->count();
        $pendingVerifCount     = StudentVerification::where('status', 'pending')->count();

        // Alert: users with 3+ failed validations today
        $failedValidationAlerts = ValidationLog::select('user_id', DB::raw('count(*) as failure_count'))
            ->where('status', 'failure')
            ->whereDate('created_at', today())
            ->groupBy('user_id')
            ->having('failure_count', '>=', 3)
            ->get();

        $alertUsers = [];
        if ($failedValidationAlerts->isNotEmpty()) {
            $userIds = $failedValidationAlerts->pluck('user_id');
            $users = User::whereIn('id', $userIds)->get()->keyBy('id');
            foreach ($failedValidationAlerts as $alert) {
                $user = $users->get($alert->user_id);
                $alertUsers[] = [
                    'user_id'       => $alert->user_id,
                    'user_name'     => $user?->full_name ?? 'Inconnu',
                    'user_email'    => $user?->email ?? '',
                    'failure_count' => (int) $alert->failure_count,
                ];
            }
        }

        return response()->json([
            'status' => 'success',
            'data'   => [
                'stats'                    => $stats,
                'chart_data'               => $chartData,
                'recent_transactions'      => $recentTransactions,
                'pending_reports_count'    => $pendingReportsCount,
                'pending_verifications_count' => $pendingVerifCount,
                'failed_validation_alerts' => $alertUsers,
                'preferences_analytics'    => $preferencesAnalytics,
            ],
        ]);
    }
}
