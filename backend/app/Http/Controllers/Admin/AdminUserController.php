<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    // GET /api/admin/users?search=&page=1
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

    // PATCH /api/admin/users/{user}/toggle-status
    public function toggleStatus(User $user)
    {
        $user->update(['is_active' => !$user->is_active]);
        $status = $user->is_active ? 'activé' : 'bloqué';
        return response()->json([
            'status' => 'success',
            'message' => "Utilisateur {$status} avec succès.",
            'data'    => ['is_active' => $user->is_active],
        ]);
    }

    // GET /api/admin/users/{user}
    public function show(User $user)
    {
        // Load relevant relations
        $user->load(['transactions']); 

        // Load tickets as well
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
}
