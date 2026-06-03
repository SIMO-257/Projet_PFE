<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Repport;
use Illuminate\Http\Request;

class AdminRapportController extends Controller
{
    /**
     * GET /api/admin/repports?statut=
     * List all repports with optional status filter.
     */
    public function index(Request $request)
    {
        $query = Repport::with('client:id,full_name,email');

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        $repports = $query->orderBy('created_at', 'desc')->paginate(20);

        // Counts by status
        $counts = [
            'en_attente' => Repport::where('statut', 'en attente')->count(),
            'en_cours'   => Repport::where('statut', 'en cours')->count(),
            'resolu'     => Repport::where('statut', 'résolu')->count(),
        ];

        return response()->json([
            'status' => 'success',
            'data'   => $repports,
            'counts' => $counts,
        ]);
    }

    /**
     * PATCH /api/admin/repports/{id}/statut
     * Advance or set the status of a repport.
     */
    public function updateStatut(Request $request, $id)
    {
        $repport = Repport::findOrFail($id);

        $validated = $request->validate([
            'statut' => 'required|string|in:en attente,en cours,résolu',
        ]);

        $repport->update(['statut' => $validated['statut']]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Statut mis à jour avec succès.',
            'data'    => $repport,
        ]);
    }
}
