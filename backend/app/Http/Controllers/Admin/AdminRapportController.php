<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Rapport;
use Illuminate\Http\Request;

class AdminRapportController extends Controller
{
    /**
     * GET /api/admin/rapports?statut=
     * List all rapports with optional status filter.
     */
    public function index(Request $request)
    {
        $query = Rapport::with('client:id,full_name,email');

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        $rapports = $query->orderBy('created_at', 'desc')->paginate(20);

        // Counts by status
        $counts = [
            'en_attente' => Rapport::where('statut', 'en attente')->count(),
            'en_cours'   => Rapport::where('statut', 'en cours')->count(),
            'resolu'     => Rapport::where('statut', 'résolu')->count(),
        ];

        return response()->json([
            'status' => 'success',
            'data'   => $rapports,
            'counts' => $counts,
        ]);
    }

    /**
     * PATCH /api/admin/rapports/{id}/statut
     * Advance or set the status of a rapport.
     */
    public function updateStatut(Request $request, $id)
    {
        $rapport = Rapport::findOrFail($id);

        $validated = $request->validate([
            'statut' => 'required|string|in:en attente,en cours,résolu',
        ]);

        $rapport->update(['statut' => $validated['statut']]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Statut mis à jour avec succès.',
            'data'    => $rapport,
        ]);
    }
}
