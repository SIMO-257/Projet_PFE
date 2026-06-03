<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;

class AdminTicketController extends Controller
{
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

    public function export(Request $request)
    {
        $query = Ticket::with(['user', 'ticketType']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $tickets = $query->orderBy('created_at', 'desc')->get();
        $filename = 'tickets-' . now()->format('Y-m-d-His') . '.csv';

        return $this->csvDownload($tickets,
            ['UUID', 'Type', 'Client', 'Email', 'Statut', 'Prix', 'Achete le'],
            function ($ticket) {
                $typeName = '';
                if ($ticket->ticketType) {
                    $raw = $ticket->ticketType->getRawOriginal('name');
                    $decoded = is_string($raw) ? json_decode($raw, true) : (is_array($raw) ? $raw : []);
                    $typeName = $decoded['fr'] ?? ($decoded['en'] ?? '');
                }
                return [
                    $ticket->uuid,
                    $typeName,
                    $ticket->user?->full_name ?? 'N/A',
                    $ticket->user?->email ?? '',
                    $ticket->status,
                    (float) $ticket->price_paid,
                    $ticket->created_at?->format('Y-m-d H:i:s'),
                ];
            },
            $filename
        );
    }
}
