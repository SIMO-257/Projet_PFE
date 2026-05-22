<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClientRequest;
use App\Http\Requests\ProfileRequest;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;

use App\Models\AuditLog;

class ClientController extends Controller
{
    public function home()
    {
        return $this->successResponse(null, 'Home endpoint is available.');
    }

    public function fetch_profile(Request $request)
    {
        $client = $request->user();
        return $this->successResponse([
            'name' => $client->full_name ?: 'Utilisateur',
            'client_uuid' => $client->uuid,
            'email' => $client->email,
            'phone' => $client->phone,
            'created_at' => $client->created_at->toDateString(),
            'avatar_url' => $client->avatar_path ? Storage::disk('public')->url($client->avatar_path) : null,
        ]);
    }

    public function update_profile(ProfileRequest $request)
    {
        /** @var Client $client */
        $client = $request->user();

        $validated = $request->validated();
        $client->fill($validated);
        
        $this->applyProfileFile($client, $request, 'profile_file');

        $client->save();
        $client->refresh();

        \Illuminate\Support\Facades\Log::info('Profile Saved', [
            'client_id' => $client->id,
            'full_name' => $client->full_name,
            'has_avatar' => !empty($client->avatar_path)
        ]);

        AuditLog::log('profile_update', $client->id);

        return $this->successResponse([
            'name' => $client->full_name,
            'email' => $client->email,
            'phone' => $client->phone,
            'avatar_url' => $client->avatar_path ? Storage::disk('public')->url($client->avatar_path) : null,
        ], 'Profile updated successfully.');
    }


    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'remember_me' => 'nullable|boolean',
        ]);

        $client = Client::where('email', $credentials['email'])->first();

        if ($client && Hash::check($credentials['password'], $client->password_hash)) {
            // Disconnect other active sessions to enforce single device usage
            $client->tokens()->delete();

            if (!$client->hasVerifiedEmail()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Votre email n\'est pas vérifié. Vérifiez votre boîte mail ou demandez un nouvel email.',
                    'error'   => 'email_not_verified',
                    'email'   => $client->email,
                ], 403);
            }

            if (!$client->is_active) {
                AuditLog::log('login_failed_inactive', $client->id, ['email' => $credentials['email']]);
                return $this->errorResponse('Account is inactive.', 403);
            }

            $client->last_active_at = now();
            $client->save();

            AuditLog::log(
                'security',
                $client->id,
                [
                    'type' => 'info',
                    'message' => 'Nouvelle connexion',
                    'details' => "Une nouvelle connexion a été détectée sur votre compte le " . now()->format('d/m à H:i') . ".",
                    'ip' => $request->ip(),
                    'agent' => $request->userAgent()
                ]
            );

            $token = $client->createToken('auth_token')->plainTextToken;

            return $this->successResponse([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'remember_me' => $client->remember_me ?? false,
            ], 'Login successful.');
        }

        AuditLog::log('login_failed', null, ['email' => $credentials['email']]);

        return $this->errorResponse('Invalid credentials.', 422, [
            'email' => ['The provided credentials do not match our records.'],
        ]);
    }

 
    public function signup(ClientRequest $request)
    {
        $data = $request->validated();

        // Prevent signups if email or phone already exist in clients or pending registrations
        if (Client::where('email', $data['email'])->exists() || \App\Models\PendingRegistration::where('email', $data['email'])->exists()) {
            return $this->errorResponse('This email is already used.', 422, ['email' => ['This email is already used.']]);
        }
        if (Client::where('phone', $data['phone'] ?? '')->exists() || \App\Models\PendingRegistration::where('phone', $data['phone'] ?? '')->exists()) {
            return $this->errorResponse('This phone number is already used.', 422, ['phone' => ['This phone number is already used.']]);
        }

        // Create a pending registration — the real Client will be created after email verification
        $pending = \App\Models\PendingRegistration::create([
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password_hash' => Hash::make($data['password']),
            'avatar_path' => null,
            'full_name' => $data['full_name'],
        ]);

        // Handle optional profile file upload
        if ($request->hasFile('profile_file')) {
            $pending->avatar_path = $request->file('profile_file')->store('avatars', 'public');
            $pending->save();
        }

        $code = $pending->generateVerificationCode();
        $pending->notify(new \App\Notifications\VerifyEmailNotification($code));

        AuditLog::log('signup', null, ['email' => $pending->email]);

        return $this->successResponse(null, 'Account pending verification. Check your email for the verification code.', 201);
    }


    public function logout(Request $request)
    {
        /** @var Client|null $client */
        $client = $request->user();
        $userId = $client?->id;

        if ($client) {
            $client->last_active_at = null;
            $client->save();
            $client->currentAccessToken()->delete();
        }

        AuditLog::log('logout', $userId);

        return $this->successResponse(null, 'Logout successful.');
    }

    

    public function forgotPassword(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
        ]);

        $client = Client::where('email', $data['email'])
            ->where('is_active', true)
            ->first();

        if ($client) {
            AuditLog::log('forgot_password_request', $client->id, ['email' => $data['email']]);
            Password::broker('clients')->sendResetLink([
                'email' => $data['email'],
            ]);
        }

        return $this->successResponse(null, 'If the account exists, a reset link has been sent to the email.');
    }

    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => [
                'required',
                'string',
                'confirmed',
                \Illuminate\Validation\Rules\Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
        ]);

        $status = Password::broker('clients')->reset(
            $data,
            function (Client $client, string $password): void {
                $client->password_hash = Hash::make($password);
                $client->save();
                AuditLog::log('password_reset_success', $client->id);
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            AuditLog::log('password_reset_failed', null, ['email' => $data['email'], 'status' => $status]);
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return $this->successResponse(null, 'Password has been reset successfully.');
    }

    public function updateFcmToken(Request $request)
    {
        $request->validate(['fcm_token' => 'required|string']);
        $request->user()->update(['fcm_token' => $request->fcm_token]);
        return $this->successResponse(null, 'FCM token updated');
    }

    public function getNotificationPreferences(Request $request)
    {
        return $this->successResponse([
            'notification_prefs' => $request->user()->notification_prefs ?? [
                'validation' => true,
                'payment' => true,
                'security' => true,
                'promo' => false,
            ]
        ], 'Notification preferences fetched successfully');
    }

    public function updateNotificationPreferences(Request $request)
    {
        $validated = $request->validate([
            'preferences' => 'required|array',
            'preferences.validation' => 'boolean',
            'preferences.payment' => 'boolean',
            'preferences.security' => 'boolean',
            'preferences.promo' => 'boolean',
        ]);

        $request->user()->update(['notification_prefs' => $validated['preferences']]);
        
        return $this->successResponse(null, 'Notification preferences updated');
    }

    public function getPreferences(Request $request)
    {
        $defaults = [
            'analytics_enabled'        => true,
            'auth_purchase'            => false,
            'pin_enabled'              => true,
            'biometric_enabled'        => false,
            'anti_replay_alerts'       => true,
            'suspicious_activity_alerts' => true,
            'card_frozen'              => false,
        ];

        $prefs = array_merge($defaults, $request->user()->client_preferences ?? []);

        return $this->successResponse($prefs, 'Client preferences fetched successfully');
    }

    public function updatePreferences(Request $request)
    {
        $validated = $request->validate([
            'analytics_enabled'          => 'sometimes|boolean',
            'auth_purchase'              => 'sometimes|boolean',
            'pin_enabled'                => 'sometimes|boolean',
            'biometric_enabled'          => 'sometimes|boolean',
            'anti_replay_alerts'         => 'sometimes|boolean',
            'suspicious_activity_alerts' => 'sometimes|boolean',
            'card_frozen'                => 'sometimes|boolean',
        ]);

        $current = $request->user()->client_preferences ?? [];
        $updated = array_merge($current, $validated);

        $request->user()->update(['client_preferences' => $updated]);

        return $this->successResponse($updated, 'Préférences mises à jour');
    }



    private function applyProfileFile(Client $client, Request $request, string $key): void
    {
        if ($request->hasFile($key)) {
            // Delete old file if exists
            if ($client->avatar_path) {
                Storage::disk('public')->delete($client->avatar_path);
            }
            $client->avatar_path = $request->file($key)->store('avatars', 'public');
        }
    }
}
