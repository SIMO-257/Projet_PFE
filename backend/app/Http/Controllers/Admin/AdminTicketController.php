<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;

class AdminTicketController extends Controller
{
    // GET /api/admin/tickets?search=&status=&page=1
    public function index(Request $request)
    {
        $query = Ticket::with(['user', 'ticketType']);

        if ($request->filled('search')) {
            $query->where('uuid', 'like', "%{$request->search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $tickets = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'status' => 'success',
            'data' => $tickets
        ]);
    }
}
