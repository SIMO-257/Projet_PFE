<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Mail\ForgotPasswordMail;


class ClientController extends Controller
{

    // Handle the login form submission
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $client = Client::where('email', $credentials['email'])->first();
        $valid = $client && Hash::check($credentials['password'], $client->password_hash);

        if ($valid) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Login successful.',
                    'redirect' => '/home',
                ]);
            }

            $request->session()->regenerate();
        }

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Invalid credentials.',
                'errors' => [
                    'email' => ['The provided credentials do not match our records.'],
                ],
            ], 422);
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ]);


    }

    public function home()
    {
        return redirect('/home');
    }

    // Handle the signup form submission
    public function signup(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255|unique:clients,email',
            'phone' => ['required', 'string', 'regex:/^(06|07)\d{8}$/', 'unique:clients,phone'],
            'password' => 'required|string|min:8|confirmed',
            'full_name' => 'nullable|string|max:255',
            'first_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
        ]);

        $validator->after(function ($validator) use ($request) {
            $fullName = trim((string) $request->input('full_name', ''));
            if ($fullName !== '') {
                $parts = preg_split('/[\s,]+/', $fullName, -1, PREG_SPLIT_NO_EMPTY);
                if (count($parts) < 2) {
                    $validator->errors()->add('full_name', 'Le nom complet doit contenir le nom de famille puis le prenom.');
                }
            }
        });

        $data = $validator->validate();

        if (!empty($data['full_name'])) {
            $parts = preg_split('/[\s,]+/', trim($data['full_name']), -1, PREG_SPLIT_NO_EMPTY);
            $familyName = array_shift($parts) ?: null;
            $personalName = count($parts) ? implode(' ', $parts) : null;
            $data['last_name'] = $familyName;
            $data['first_name'] = $personalName;
        }

        Client::create([
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password_hash' => Hash::make($data['password']),
            'first_name' => $data['first_name'] ?? null,
            'last_name' => $data['last_name'] ?? null,
            'is_active' => true,
        ]);

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Account created successfully.',
                'redirect' => '/login',
            ], 201);
        }

        return redirect('/login')->with('status', 'Account created successfully.');
    }

    // Logout
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/login');
    }

    // Forgot password: send a temporary password if account exists and is active
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

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'If the account exists, a password has been sent to the email.',
            ]);
        }

        return back()->with('status', 'If the account exists, a password has been sent to the email.');
    }
}
