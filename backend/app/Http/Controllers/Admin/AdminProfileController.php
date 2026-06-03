<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AdminProfileController extends Controller
{
    /**
     * Update the admin's profile.
     */
    public function update(Request $request)
    {
        $admin = $request->user();

        $request->validate([
            'first_name' => 'required|string|max:50',
            'last_name'  => 'required|string|max:50',
            'email'      => 'required|email|unique:admins,email,' . $admin->id,
            'password'   => ['nullable', 'confirmed', Password::min(8)],
        ]);

        $admin->first_name = $request->first_name;
        $admin->last_name = $request->last_name;
        $admin->email = $request->email;

        if ($request->filled('password')) {
            $admin->password = Hash::make($request->password);
        }

        $admin->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Profil mis à jour avec succès.',
            'admin' => $admin
        ]);
    }
}
