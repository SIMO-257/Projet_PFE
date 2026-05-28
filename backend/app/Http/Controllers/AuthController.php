<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\Models\User;
use App\Models\AuditLog;
use App\Models\PendingRegistration;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'remember_me' => 'nullable|boolean',
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if ($user && Hash::check($credentials['password'], $user->password_hash)) {
            $user->tokens()->delete();

            if (!$user->hasVerifiedEmail()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Votre email n\'est pas vérifié. Vérifiez votre boîte mail ou demandez un nouvel email.',
                    'error'   => 'email_not_verified',
                    'email'   => $user->email,
                ], 403);
            }

            if (!$user->is_active) {
                AuditLog::log('login_failed_inactive', $user->id, ['email' => $credentials['email']]);
                return $this->errorResponse('Account is inactive.', 403);
            }

            $user->last_active_at = now();
            $user->save();

            AuditLog::log(
                'security',
                $user->id,
                [
                    'type' => 'info',
                    'message' => 'Nouvelle connexion',
                    'details' => "Une nouvelle connexion a été détectée sur votre compte le " . now()->format('d/m à H:i') . ".",
                    'ip' => $request->ip(),
                    'agent' => $request->userAgent()
                ]
            );

            $token = $user->createToken('auth_token')->plainTextToken;

            return $this->successResponse([
                'access_token' => $token,
                'token_type' => 'Bearer',
            ], 'Login successful.');
        }

        AuditLog::log('login_failed', null, ['email' => $credentials['email']]);

        return $this->errorResponse('Invalid credentials.', 422, [
            'email' => ['The provided credentials do not match our records.'],
        ]);
    }

    public function signup(UserRequest $request)
    {
        $data = $request->validated();

        if (User::where('email', $data['email'])->exists() || PendingRegistration::where('email', $data['email'])->exists()) {
            return $this->errorResponse('This email is already used.', 422, ['email' => ['This email is already used.']]);
        }
        if (User::where('phone', $data['phone'] ?? '')->exists() || PendingRegistration::where('phone', $data['phone'] ?? '')->exists()) {
            return $this->errorResponse('This phone number is already used.', 422, ['phone' => ['This phone number is already used.']]);
        }

        $pending = PendingRegistration::create([
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password_hash' => Hash::make($data['password']),
            'avatar_path' => null,
            'full_name' => $data['full_name'],
        ]);

        if ($request->hasFile('profile_file')) {
            $pending->avatar_path = $request->file('profile_file')->store('avatars', 'public');
            $pending->save();
        }

        $code = $pending->generateVerificationCode();
        try {
            $pending->notify(new VerifyEmailNotification($code));
        } catch (\Throwable $e) {
            Log::warning('Failed to send verification email', [
                'email' => $pending->email,
                'error' => $e->getMessage(),
            ]);
        }

        AuditLog::log('signup', null, ['email' => $pending->email]);

        return $this->successResponse(null, 'Account pending verification. Check your email for the verification code.', 201);
    }

    public function logout(Request $request)
    {
        /** @var User|null $user */
        $user = $request->user();
        $userId = $user?->id;

        if ($user) {
            $user->last_active_at = null;
            $user->save();
            $user->currentAccessToken()->delete();
        }

        AuditLog::log('logout', $userId);

        return $this->successResponse(null, 'Logout successful.');
    }

    public function forgotPassword(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $data['email'])
            ->where('is_active', true)
            ->first();

        if ($user) {
            AuditLog::log('forgot_password_request', $user->id, ['email' => $data['email']]);
            Password::broker('users')->sendResetLink([
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
                PasswordRule::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
        ]);

        $status = Password::broker('users')->reset(
            $data,
            function (User $user, string $password): void {
                $user->password_hash = Hash::make($password);
                $user->save();
                AuditLog::log('password_reset_success', $user->id);
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
}
