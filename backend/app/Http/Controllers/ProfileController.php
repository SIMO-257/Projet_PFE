<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileRequest;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function home()
    {
        return $this->successResponse(null, 'Home endpoint is available.');
    }

    public function fetch_profile(Request $request)
    {
        $user = $request->user();
        return $this->successResponse([
            'name' => $user->full_name ?: 'Utilisateur',
            'client_uuid' => $user->uuid,
            'email' => $user->email,
            'phone' => $user->phone,
            'created_at' => $user->created_at->toDateString(),
            'avatar_url' => $user->avatar_path ? Storage::disk('spaces')->url($user->avatar_path) : null,
            'is_student' => (bool) $user->is_student,
        ]);
    }

    public function update_profile(ProfileRequest $request)
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validated();
        $user->fill($validated);

        $this->applyProfileFile($user, $request, 'profile_file');

        $user->save();
        $user->refresh();

        Log::info('Profile Saved', [
            'user_id' => $user->id,
            'full_name' => $user->full_name,
            'has_avatar' => !empty($user->avatar_path)
        ]);

        AuditLog::log('profile_update', $user->id);

        return $this->successResponse([
            'name' => $user->full_name,
            'email' => $user->email,
            'phone' => $user->phone,
            'avatar_url' => $user->avatar_path ? Storage::disk('public')->url($user->avatar_path) : null,
            'is_student' => (bool) $user->is_student,
        ], 'Profile updated successfully.');
    }

    private function applyProfileFile(User $user, Request $request, string $key): void
    {
        if ($request->hasFile($key)) {
            if ($user->avatar_path) {
                Storage::disk('public')->delete($user->avatar_path);
            }
            $user->avatar_path = $request->file($key)->store('avatars', 'public');
        }
    }
}
