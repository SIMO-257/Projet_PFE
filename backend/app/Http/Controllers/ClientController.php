<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Mail\ForgotPasswordMail;
use Illuminate\Support\Facades\Validator;


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
            'avatar' => $client->avatar,
            'avatar_url' => $client->avatar_url,
        ]);
    }

    public function update_profile(Request $request)
    {
        $client = $request->attributes->get('client');
        if (!$client) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $validated = (array) $request->attributes->get('validated_profile', []);
        $client->phone = $validated['phone'] ?? $client->phone;

        $fullName = trim((string) ($validated['full_name'] ?? ''));
        if ($fullName !== '') {
            $parts = preg_split('/[\s,]+/', $fullName, -1, PREG_SPLIT_NO_EMPTY);
            $familyName = array_shift($parts) ?: null;
            $personalName = count($parts) ? implode(' ', $parts) : null;
            $client->last_name = $familyName;
            $client->first_name = $personalName;
        }

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
            'avatar' => $client->avatar,
            'avatar_url' => $client->avatar_url,
        ]);
    }

    public function upload_avatar(Request $request)
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

        $validator = Validator::make($request->all(), [
            'avatar' => 'required|file|max:5120|mimes:jpg,jpeg,png,webp',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $file = $request->file('avatar');
        $client->storeAvatar($file);

        return response()->json([
            'avatar' => $client->avatar,
            'avatar_url' => $client->avatar_url,
        ]);
    }


    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $client = Client::where('email', $credentials['email'])->first();
        $valid = $client && Hash::check($credentials['password'], $client->password_hash);

        if ($valid) {
            return response()->json([
                'message' => 'Login successful.',
                'client_uuid' => $client->uuid,
            ]);
        }

        return response()->json([
            'message' => 'Invalid credentials.',
            'errors' => [
                'email' => ['The provided credentials do not match our records.'],
            ],
        ], 422);
    }

 
    public function signup(Request $request)
    {
        $data = (array) $request->attributes->get('validated_signup', []);

        Client::create([
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password_hash' => Hash::make($data['password']),
            'first_name' => $data['first_name'] ?? null,
            'last_name' => $data['last_name'] ?? null,
            'is_active' => true,
        ]);

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

    
}
