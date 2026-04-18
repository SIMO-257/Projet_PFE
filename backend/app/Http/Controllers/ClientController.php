<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClientRequest;
use App\Http\Requests\ProfileRequest;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Mail\ForgotPasswordMail;


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
        $uuid = $request->header('X-Client-UUID')
            ?? $request->query('uuid')
            ?? $request->session()->get('client_uuid');

        if (!$uuid) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $client = Client::where('uuid', $uuid)->first();

        if (!$client) {
            return response()->json(['message' => 'Client not found.'], 404);
        }

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
        ]);
    }

    public function update_profile(ProfileRequest $request)
    {
        $client = $request->clientModel();
        $validated = $request->validated();
        $client->phone = $validated['phone'];
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
        ]);
    }


    public function login(Request $request)
    {
        $client = $request->attributes->get('client');
        return response()->json([
            'message' => 'Login successful.',
            'client_uuid' => $client->uuid,
        ]);
    }

 
    public function signup(ClientRequest $request)
    {
        $data = $request->validated();

        $client = Client::create([
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password_hash' => Hash::make($data['password']),
            'profile_file' => $request->hasFile('profile_file') ? file_get_contents($request->file('profile_file')->getRealPath()) : null,
            'is_active' => true,
        ]);
        $this->applyName($client, $data);
        $client->save();

        return response()->json([
            'message' => 'Account created successfully.',
        ], 201);
    }


    public function logout(Request $request)
    {
        $uuid = $request->header('X-Client-UUID')
            ?? $request->input('uuid')
            ?? $request->query('uuid');

        Auth::logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json([
            'message' => 'Logout successful.',
            'client_uuid' => $uuid,
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
        ]);

        $client = Client::where('email', $data['email'])->first();

        if ($client && $client->is_active) {
            $tempPassword = Str::random(10);
            $client->password_hash = Hash::make($tempPassword);
            $client->save();

            Mail::to($client->email)->send(new ForgotPasswordMail($tempPassword));
        }

        return response()->json([
            'message' => 'If the account exists, a password has been sent to the email.',
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
}
