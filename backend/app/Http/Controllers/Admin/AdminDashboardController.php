<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Ticket;
use App\Models\Transaction;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    // GET /api/admin/dashboard
    public function index()
    {
        $stats = [
            'total_clients'      => Client::count(),
            'active_clients'     => Client::where('is_active', true)->count(),
            'total_tickets'      => Ticket::count(),
            'validated_tickets'  => Ticket::where('status', 'validated')->count(),
            'total_revenue'      => Transaction::where('type', 'recharge')->where('status', 'completed')->sum('amount'),
            'transactions_today' => Transaction::whereDate('created_at', today())->count(),
            'new_clients_today'  => Client::whereDate('created_at', today())->count(),
            'revenue_today'      => Transaction::where('type', 'recharge')->where('status', 'completed')->whereDate('created_at', today())->sum('amount'),
        ];

        return response()->json([
            'status' => 'success',
            'data' => $stats
        ]);
    }
}
