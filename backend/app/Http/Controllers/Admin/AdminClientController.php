<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;

class AdminClientController extends Controller
{
    // GET /api/admin/clients?search=&page=1
    public function index(Request $request)
    {
        $query = Client::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('full_name', 'like', "%{$search}%");
            });
        }

        $clients = $query
            ->select('id', 'full_name', 'email', 'is_active', 'created_at')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'status' => 'success',
            'data' => $clients
        ]);
    }

    // PATCH /api/admin/clients/{id}/toggle-status
    public function toggleStatus(Client $client)
    {
        $client->update(['is_active' => !$client->is_active]);
        $status = $client->is_active ? 'activé' : 'bloqué';
        return response()->json([
            'status' => 'success',
            'message' => "Client {$status} avec succès.",
            'data'    => ['is_active' => $client->is_active],
        ]);
    }

    // GET /api/admin/clients/{id}
    public function show(Client $client)
    {
        // Load relevant relations
        $client->load(['transactions']); 
        
        // Custom relation for tickets if needed, but 'tickets' usually maps to tickets table
        // We'll try to load 'tickets' as well
        try {
            $client->load(['tickets']);
        } catch (\Exception $e) {
            // Relation might not be defined on Client model yet
        }

        return response()->json([
            'status' => 'success',
            'data' => $client
        ]);
    }
}
