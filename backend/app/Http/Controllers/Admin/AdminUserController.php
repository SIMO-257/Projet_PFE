<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('full_name', 'like', "%{$search}%");
            });
        }

        $users = $query
            ->select('id', 'full_name', 'email', 'is_active', 'created_at')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'status' => 'success',
            'data' => $users
        ]);
    }

    public function toggleStatus(User $user, NotificationService $notifier)
    {
        $user->update(['is_active' => !$user->is_active]);
        $status = $user->is_active ? 'active' : 'bloqué';
        $statusLabel = $user->is_active ? 'activé' : 'désactivé';

        $notifier->send(
            $user,
            'security',
            'warning',
            'Compte ' . $statusLabel,
            "Votre compte a été {$statusLabel} par l'administrateur.",
        );

        return response()->json([
            'status' => 'success',
            'message' => "Utilisateur {$status} avec succès.",
            'data'    => ['is_active' => $user->is_active],
        ]);
    }

    public function show(User $user)
    {
        $user->load(['transactions']);

        try {
            $user->load(['tickets']);
        } catch (\Exception $e) {
            // Relation might not be defined
        }

        return response()->json([
            'status' => 'success',
            'data' => $user
        ]);
    }

    public function export(Request $request)
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('full_name', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->get();
        $filename = 'utilisateurs-' . now()->format('Y-m-d-His') . '.xls';

        return $this->csvDownload($users,
            ['ID', 'Nom', 'Email', 'Actif', 'Inscrit le'],
            fn($user) => [
                $user->id,
                $user->full_name,
                $user->email,
                $user->is_active ? 'Oui' : 'Non',
                $user->created_at?->format('Y-m-d H:i:s'),
            ],
            $filename
        );
    }
}
