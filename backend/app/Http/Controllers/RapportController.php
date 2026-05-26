<?php

namespace App\Http\Controllers;

use App\Models\Rapport;
use Illuminate\Http\Request;

class RapportController extends Controller
{
    /**
     * GET /api/help
     * Return all rapports for the authenticated user.
     */
    public function index(Request $request)
    {
        $rapports = Rapport::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->successResponse($rapports, 'Rapports récupérés avec succès.');
    }

    /**
     * POST /api/rapports
     * Store a new rapport (report or direct message).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type_probleme' => 'required|string|in:Paiement,Billet invalide,Problème technique,Autre,Message direct',
            'sujet'         => 'nullable|string|max:255',
            'description'   => 'required|string|max:5000',
        ]);

        $rapport = Rapport::create([
            'user_id'       => $request->user()->id,
            'type_probleme' => $validated['type_probleme'],
            'sujet'         => $validated['sujet'] ?? null,
            'description'   => $validated['description'],
            'statut'        => 'en attente',
        ]);

        return $this->successResponse($rapport, 'Rapport soumis avec succès.', 201);
    }
}
