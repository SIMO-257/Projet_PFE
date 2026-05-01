<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClientRequest;
use App\Http\Requests\ProfileRequest;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;


class ClientController extends Controller
{
    public function home()
    {
        return response()->json([
            'message' => 'Home endpoint is available.',
        ]);
    }

    public function fetch_profile(Request $request)
    {
        $client = $request->user();

        $name = trim(($client->first_name ?? '').' '.($client->last_name ?? ''));
        if ($name === '') {
            $name = $client->email;
        }

        return response()->json([
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

        if (array_key_exists('phone', $validated)) {
            $client->phone = $validated['phone'] ?: null;
        }
        $this->applyName($client, $validated);
        $this->applyProfileFile($client, $request, 'profile_file');

        $client->save();

        $name = trim(($client->first_name ?? '').' '.($client->last_name ?? ''));
        if ($name === '') {
            $name = $client->email;
        }

        return response()->json([
            'name' => $name,
            'email' => $client->email,
            'phone' => $client->phone,
            'created_at' => $client->created_at->toDateString(),
            'has_profile_file' => !is_null($client->profile_file),
            'avatar_url' => $this->avatarDataUrl($client->profile_file),
        ]);
    }


    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'remember_me' => 'nullable|boolean',
        ]);

        $email = trim($data['email']);

        $client = Client::where('email', $email)
            ->where('is_active', true)
            ->first();

        if (!$client || !Hash::check($data['password'], $client->password_hash)) {
            return response()->json([
                'message' => 'Invalid credentials.',
                'errors' => [
                    'email' => ['The provided credentials do not match our records.'],
                ],
            ], 422);
        }

        $client->remember_me = (bool) ($data['remember_me'] ?? false);
        $client->save();

        $token = $client->createToken('client-api-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'token' => $token,
            'token_type' => 'Bearer',
            'remember_me' => $client->remember_me,
            'client_uuid' => $client->uuid,
        ]);
    }

 
    public function signup(ClientRequest $request)
    {
        $data = $request->validated();

        $client = Client::create([
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password_hash' => $data['password'],
            'profile_file' => $this->defaultAvatarBinary(),
            'is_active' => true,
        ]);
        $this->applyName($client, $data);
        $this->applyProfileFile($client, $request, 'profile_file');
        $client->save();

        return response()->json([
            'message' => 'Account created successfully.',
        ], 201);
    }


    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logout successful.',
        ]);
    }

    public function logoutAll(Request $request)
    {
        $request->user()?->tokens()->delete();

        return response()->json([
            'message' => 'Logged out from all devices.',
        ]);
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
            Password::broker('clients')->sendResetLink([
                'email' => $data['email'],
            ]);
        }

        return response()->json([
            'message' => 'If the account exists, a reset link has been sent to the email.',
        ]);
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
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return response()->json([
            'message' => 'Password has been reset successfully.',
        ]);
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
