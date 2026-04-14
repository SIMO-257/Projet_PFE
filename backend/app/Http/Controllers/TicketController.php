<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\TicketType;
use App\Models\Wallet;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class TicketController extends Controller
{
    /**
     * Get all active ticket types.
     */
    public function getTicketTypes()
    {
        $types = TicketType::where('is_active', true)->get();
        return response()->json($types);
    }

    /**
     * Purchase a ticket.
     */
    public function purchase(Request $request)
    {
        $validated = $request->validate([
            'ticket_type_id' => 'required|exists:ticket_types,id',
            'quantity' => 'required|integer|min:1|max:10',
            'client_uuid' => 'required|exists:clients,uuid',
        ]);

        $client = \App\Models\Client::where('uuid', $validated['client_uuid'])->first();
        $ticketType = TicketType::find($validated['ticket_type_id']);
        
        $totalPrice = $ticketType->price * $validated['quantity'];

        // Get or create wallet
        $wallet = Wallet::firstOrCreate(
            ['user_id' => $client->id],
            ['balance' => 0.00, 'currency' => 'DH']
        );

        if ($wallet->balance < $totalPrice) {
            return response()->json([
                'message' => 'Solde insuffisant.',
                'errors' => ['balance' => ['Votre solde est insuffisant pour cet achat.']]
            ], 422);
        }

        try {
            return DB::transaction(function () use ($wallet, $totalPrice, $ticketType, $validated, $client) {
                $balanceBefore = $wallet->balance;
                
                // 1. Deduct from wallet
                $wallet->balance -= $totalPrice;
                $wallet->save();

                // 2. Create Transaction Log
                $transaction = Transaction::create([
                    'uuid' => (string) Str::uuid(),
                    'user_id' => $client->id,
                    'type' => 'debit',
                    'amount' => $totalPrice,
                    'balance_before' => $balanceBefore,
                    'balance_after' => $wallet->balance,
                    'reference' => "Achat de {$validated['quantity']} " . ($validated['quantity'] > 1 ? 'billets' : 'billet'),
                ]);

                // 3. Create Tickets
                $tickets = [];
                for ($i = 0; $i < $validated['quantity']; $i++) {
                    $ticket = Ticket::create([
                        'uuid' => (string) Str::uuid(),
                        'user_id' => $client->id,
                        'ticket_type_id' => $ticketType->id,
                        'status' => 'active',
                        'valid_from' => now(),
                        'valid_until' => now()->addMinutes($ticketType->duration_minutes ?? 60),
                        'remaining_uses' => $ticketType->max_uses ?? 1,
                        'price_paid' => $ticketType->price,
                    ]);
                    $tickets[] = $ticket;
                }

                return response()->json([
                    'message' => 'Achat réussi !',
                    'tickets' => $tickets,
                    'new_balance' => $wallet->balance
                ], 201);
            });
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Une erreur est survenue lors de la transaction.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get ticket details.
     */
    public function show($identifier)
    {
        // Try to find by UUID first, then by ID
        $ticket = Ticket::with('ticketType')
            ->where('uuid', $identifier)
            ->orWhere('id', $identifier)
            ->first();

        if (!$ticket) {
            return response()->json(['message' => 'Ticket non trouvé.'], 404);
        }

        return response()->json($ticket);
    }

    /**
     * Get all tickets for a client.
     */
    public function index(Request $request)
    {
        $uuid = $request->header('X-Client-UUID');
        $client = \App\Models\Client::where('uuid', $uuid)->first();

        if (!$client) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $tickets = Ticket::where('user_id', $client->id)
            ->with('ticketType')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($tickets);
    }
}
