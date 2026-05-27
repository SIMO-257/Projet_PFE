<?php

namespace App\Http\Controllers;

use App\Models\Repport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RapportController extends Controller
{
    /**
     * GET /api/help
     * Return all repports for the authenticated user.
     */
    public function index(Request $request)
    {
        $repports = Repport::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->successResponse($repports, 'Repports récupérés avec succès.');
    }

    /**
     * POST /api/repports
     * Store a new repport (report or direct message) with optional screenshot.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type_probleme' => 'required|string|in:Paiement,Billet invalide,Problème technique,Autre,Message direct',
            'sujet'         => 'nullable|string|max:255',
            'description'   => 'required|string|max:5000',
            'image'         => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('repports_images', 'public');
        }

        $repport = Repport::create([
            'user_id'       => $request->user()->id,
            'type_probleme' => $validated['type_probleme'],
            'sujet'         => $validated['sujet'] ?? null,
            'description'   => $validated['description'],
            'image_path'    => $imagePath,
            'statut'        => 'en attente',
        ]);

        return $this->successResponse($repport, 'Repport soumis avec succès.', 201);
    }
}
