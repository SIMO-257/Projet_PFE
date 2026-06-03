<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;

class AdminTransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::with('user');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('email', 'like', "%{$request->search}%");
            });
        }

        $transactions = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'status' => 'success',
            'data' => $transactions
        ]);
    }

    public function export(Request $request)
    {
        $query = Transaction::with('user');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $transactions = $query->orderBy('created_at', 'desc')->get();
        $filename = 'transactions-' . now()->format('Y-m-d-His') . '.csv';

        return $this->csvDownload($transactions,
            ['ID', 'UUID', 'Client', 'Email', 'Type', 'Montant', 'Statut', 'Date'],
            fn($tx) => [
                $tx->id,
                $tx->uuid,
                $tx->user?->full_name ?? 'N/A',
                $tx->user?->email ?? '',
                $tx->type,
                (float) $tx->amount,
                $tx->status,
                $tx->created_at?->format('Y-m-d H:i:s'),
            ],
            $filename
        );
    }
}
