<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClientRequest;
use App\Http\Requests\ProfileRequest;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;


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

        $name = trim(($client->first_name ?? '').' '.($client->last_name ?? ''));
        if ($name === '') {
            $name = $client->email;
        }

        return $this->successResponse([
            'name' => $name,
            'client_uuid' => $client->uuid,
            'email' => $client->email,
            'phone' => $client->phone,
            'created_at' => $client->created_at->toDateString(),
            'has_profile_file' => !is_null($client->profile_file),
            'avatar_url' => $this->avatarDataUrl($client->profile_file),
        ]);
    }

    public function update_profile(ProfileRequest $request)
    {
        /** @var Client $client */
        $client = $request->user();

        $validated = $request->validated();
        \Illuminate\Support\Facades\Log::info('Profile Update Request', [
            'client_id' => $client->id,
            'full_name' => $validated['full_name'] ?? 'not provided',
            'has_file' => $request->hasFile('profile_file')
        ]);

        if (array_key_exists('phone', $validated)) {
            $client->phone = $validated['phone'] ?: null;
        }
        $this->applyName($client, $validated);
        $this->applyProfileFile($client, $request, 'profile_file');

        $client->save();
        $client->refresh();

        \Illuminate\Support\Facades\Log::info('Profile Saved', [
            'client_id' => $client->id,
            'first_name' => $client->first_name,
            'last_name' => $client->last_name,
            'has_blob' => !empty($client->profile_file)
        ]);

        AuditLog::log('profile_update', $client->id);

        $name = trim(($client->first_name ?? '').' '.($client->last_name ?? ''));
        if ($name === '') {
            $name = $client->email;
        }

        return $this->successResponse([
            'name' => $name,
            'email' => $client->email,
            'phone' => $client->phone,
            'created_at' => $client->created_at->toDateString(),
            'has_profile_file' => !is_null($client->profile_file),
            'avatar_url' => $this->avatarDataUrl($client->profile_file),
        ], 'Profile updated successfully.');
    }


    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'remember_me' => 'nullable|boolean',
        ]);

        $remember = (bool) ($credentials['remember_me'] ?? false);

        if (Auth::guard('client')->attempt(['email' => $credentials['email'], 'password' => $credentials['password']], $remember)) {
            if ($request->hasSession()) {
                $request->session()->regenerate();
            }

            /** @var Client $client */
            $client = Auth::guard('client')->user();
            
            if (!$client->is_active) {
                AuditLog::log('login_failed_inactive', $client->id, ['email' => $credentials['email']]);
                Auth::guard('client')->logout();
                return $this->errorResponse('Account is inactive.', 403);
            }

            AuditLog::log('login_success', $client->id);

            // Send Security Notification
            app(\App\Services\NotificationService::class)->send(
                $client,
                'security',
                'info',
                'Nouvelle connexion',
                "Une nouvelle connexion a été détectée sur votre compte le " . now()->format('d/m à H:i') . ".",
                ['ip' => $request->ip(), 'agent' => $request->userAgent()]
            );

            return $this->successResponse([
                'remember_me' => $client->remember_me,
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

        $client = Client::create([
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password_hash' => Hash::make($data['password']),
            'profile_file' => $this->defaultAvatarBinary(),
            'is_active' => true,
        ]);
        $this->applyName($client, $data);
        $this->applyProfileFile($client, $request, 'profile_file');
        $client->save();

        AuditLog::log('signup', $client->id);

        return $this->successResponse(null, 'Account created successfully.', 201);
    }


    public function logout(Request $request)
    {
        $userId = Auth::guard('client')->id();
        Auth::guard('client')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        AuditLog::log('logout', $userId);

        return $this->successResponse(null, 'Logout successful.');
    }

    public function logoutAll(Request $request)
    {
        $userId = $request->user()?->id;
        $request->user()?->tokens()->delete();

        AuditLog::log('logout_all', $userId);

        return $this->successResponse(null, 'Logged out from all devices.');
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
            'password' => 'required|string|min:8|confirmed',
        ]);

        $status = Password::broker('clients')->reset(
            $data,
            function (Client $client, string $password): void {
                $client->password_hash = $password;
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

    private function applyName(Client $client, array $data): void
    {
        if (!empty($data['full_name'])) {
            $parts = preg_split('/[\s,]+/', trim((string) $data['full_name']), -1, PREG_SPLIT_NO_EMPTY);
            $client->last_name = array_shift($parts) ?: null;
            $client->first_name = count($parts) ? implode(' ', $parts) : null;
            return;
        }

        if (array_key_exists('first_name', $data)) {
            $client->first_name = $data['first_name'] ?: null;
        }

        if (array_key_exists('last_name', $data)) {
            $client->last_name = $data['last_name'] ?: null;
        }
    }

    private function applyProfileFile(Client $client, Request $request, string $key): void
    {
        if ($request->hasFile($key)) {
            $client->profile_file = file_get_contents($request->file($key)->getRealPath());
        }
    }

    private function avatarDataUrl(?string $binary): ?string
    {
        if (empty($binary)) {
            return null;
        }

        $mime = (new \finfo(FILEINFO_MIME_TYPE))->buffer($binary) ?: 'image/jpeg';

        return 'data:'.$mime.';base64,'.base64_encode($binary);
    }

    private function defaultAvatarBinary(): ?string
    {
        static $cached = null;
        static $loaded = false;

        if ($loaded) {
            return $cached;
        }

        $loaded = true;
        $path = resource_path('images/default-avatar.svg');

        if (!is_file($path)) {
            return null;
        }

        $data = file_get_contents($path);
        $cached = $data === false ? null : $data;

        return $cached;
    }
}
