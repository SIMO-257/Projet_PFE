<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\Http\Requests\ProfileRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;
use App\Models\AuditLog;
use App\Models\StudentVerification;

class UserController extends Controller
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
            'avatar_url' => $user->avatar_path ? Storage::disk('public')->url($user->avatar_path) : null,
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

        \Illuminate\Support\Facades\Log::info('Profile Saved', [
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


    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'remember_me' => 'nullable|boolean',
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if ($user && Hash::check($credentials['password'], $user->password_hash)) {
            // Disconnect other active sessions to enforce single device usage
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

        // Prevent signups if email or phone already exist in users or pending registrations
        if (User::where('email', $data['email'])->exists() || \App\Models\PendingRegistration::where('email', $data['email'])->exists()) {
            return $this->errorResponse('This email is already used.', 422, ['email' => ['This email is already used.']]);
        }
        if (User::where('phone', $data['phone'] ?? '')->exists() || \App\Models\PendingRegistration::where('phone', $data['phone'] ?? '')->exists()) {
            return $this->errorResponse('This phone number is already used.', 422, ['phone' => ['This phone number is already used.']]);
        }

        // Create a pending registration — the real User will be created after email verification
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
                \Illuminate\Validation\Rules\Password::min(8)
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

        $prefs = array_merge($defaults, $request->user()->user_preferences ?? []);

        return $this->successResponse($prefs, 'User preferences fetched successfully');
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

        $current = $request->user()->user_preferences ?? [];
        $updated = array_merge($current, $validated);

        $request->user()->update(['user_preferences' => $updated]);

        return $this->successResponse($updated, 'Préférences mises à jour');
    }



    /**
     * Get the student verification status for the authenticated user.
     */
    public function studentStatus(Request $request)
    {
        $user = $request->user();
        $verification = StudentVerification::where('user_id', $user->id)->first();

        return $this->successResponse([
            'is_student' => (bool) $user->is_student,
            'verification' => $verification ? [
                'id' => $verification->id,
                'status' => $verification->status,
                'created_at' => $verification->created_at->toDateTimeString(),
            ] : null,
        ]);
    }

    /**
     * Submit student verification documents.
     */
    public function submitStudentVerification(Request $request)
    {
        $user = $request->user();

        // If already a student, reject
        if ($user->is_student) {
            return $this->errorResponse('You are already verified as a student.', 422);
        }

        // Check if there's already a pending/approved verification
        $existing = StudentVerification::where('user_id', $user->id)->first();
        if ($existing && $existing->status !== 'rejected') {
            return $this->errorResponse('A verification request already exists with status: ' . $existing->status, 422);
        }

        $validated = $request->validate([
            'cin_doc' => 'required|file|mimes:pdf,doc,docx|max:10240',
            'school_doc' => 'required|file|mimes:pdf,doc,docx|max:10240',
        ]);

        // Store files
        $cinPath = $request->file('cin_doc')->store('student_cin', 'public');
        $schoolPath = $request->file('school_doc')->store('student_school', 'public');

        // If there was a previous rejected verification, update it instead of creating new
        if ($existing) {
            // Delete old files
            Storage::disk('public')->delete($existing->cin_doc_path);
            Storage::disk('public')->delete($existing->school_doc_path);

            $existing->update([
                'cin_doc_path' => $cinPath,
                'school_doc_path' => $schoolPath,
                'status' => 'pending',
                'admin_id' => null,
                'rejected_reason' => null,
            ]);

            $verification = $existing;
        } else {
            $verification = StudentVerification::create([
                'user_id' => $user->id,
                'cin_doc_path' => $cinPath,
                'school_doc_path' => $schoolPath,
                'status' => 'pending',
            ]);
        }

        AuditLog::log('student_verification_submitted', $user->id);

        return $this->successResponse([
            'id' => $verification->id,
            'status' => $verification->status,
        ], 'Documents submitted successfully. Awaiting verification.', 201);
    }

    private function applyProfileFile(User $user, Request $request, string $key): void
    {
        if ($request->hasFile($key)) {
            // Delete old file if exists
            if ($user->avatar_path) {
                Storage::disk('public')->delete($user->avatar_path);
            }
            $user->avatar_path = $request->file($key)->store('avatars', 'public');
        }
    }
}
