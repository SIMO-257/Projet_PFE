<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\TicketType;
use App\Services\TicketValidationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TicketController extends Controller
{
    public function __construct(
        protected TicketValidationService $validationService
    ) {}

    /**
     * List all tickets for the authenticated user.
     */
    public function index()
    {
        $user = Auth::user();

        $tickets = Ticket::with('ticketType')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($ticket) use ($user) {
                $this->validationService->normalizeTicketStatus($ticket);
                $ticketArray = $ticket->toArray();
                $ticketArray['is_default'] = $ticket->id === $user->default_ticket_id;
                return $ticketArray;
            });

        return $this->successResponse($tickets);
    }

    /**
     * Show a specific ticket by UUID.
     */
    public function show(string $uuid)
    {
        $user = Auth::user();

        $ticket = Ticket::with('ticketType')
            ->where('uuid', $uuid)
            ->where('user_id', $user->id)
            ->first();

        if (!$ticket) {
            return $this->errorResponse('Billet non trouvé.', 404);
        }

        $this->validationService->normalizeTicketStatus($ticket);

        return $this->successResponse($ticket);
    }

    /**
     * Get purchased cards (tickets grouped as cards for the wallet UI).
     */
    public function cards()
    {
        $user = Auth::user();

        $cards = Ticket::with('ticketType')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($ticket) use ($user) {
                $this->validationService->normalizeTicketStatus($ticket);
                $ticketArray = $ticket->toArray();
                $ticketArray['is_default'] = $ticket->id === $user->default_ticket_id;
                return $ticketArray;
            });

        return $this->successResponse($cards);
    }

    /**
     * Set a ticket as the default card.
     */
    public function setDefaultCard(Request $request)
    {
        $request->validate([
            'ticket_id' => 'required|integer|exists:tickets,id',
        ]);

        $user = Auth::user();

        $ticket = Ticket::where('id', $request->ticket_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$ticket) {
            return $this->errorResponse('Billet non trouvé ou non autorisé.', 404);
        }

        $user->default_ticket_id = $ticket->id;
        $user->save();

        return $this->successResponse(null, 'Carte par défaut mise à jour avec succès.');
    }
}
