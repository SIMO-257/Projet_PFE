<?php

namespace App\Http\Controllers;

use App\Events\UserRegisteredEvent;
use App\Models\AuditLog;
use App\Models\PendingRegistration;
use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    // GET /email/verify/{token}
    // Called when the user clicks the link in the email
    // This is a WEB route (not API) — it redirects to the frontend
    public function verify(string $token)
    {
        // First try existing users
        $user = User::where('email_verification_token', $token)->first();
        if ($user) {
            if ($user->hasVerifiedEmail()) {
                return redirect(config('app.frontend_url') . '/verify-email?status=already_verified');
            }
            if ($user->email_verification_sent_at->lt(now()->subMinutes(60))) {
                return redirect(config('app.frontend_url') . '/verify-email?status=expired&email=' . urlencode($user->email));
            }
            $user->update([
                'email_verified_at' => now(),
                'email_verification_token' => null,
                'email_verification_sent_at' => null,
            ]);
            return redirect(config('app.frontend_url') . '/verify-email?status=success');
        }

        // Then try pending registrations
        $pending = PendingRegistration::where('email_verification_token', $token)->first();
        if (!$pending) {
            return redirect(config('app.frontend_url') . '/verify-email?status=invalid');
        }
        if ($pending->email_verification_sent_at && $pending->email_verification_sent_at->lt(now()->subMinutes(60))) {
            return redirect(config('app.frontend_url') . '/verify-email?status=expired&email=' . urlencode($pending->email));
        }

        // Create the real user
        $newUser = User::create([
            'email' => $pending->email,
            'phone' => $pending->phone,
            'password_hash' => $pending->password_hash,
            'full_name' => $pending->full_name,
            'avatar_path' => $pending->avatar_path,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $pending->delete();

        // Dispatch the registration event
        UserRegisteredEvent::dispatch($newUser);

        return redirect(config('app.frontend_url') . '/verify-email?status=success');
    }

    // POST /api/v1/email/verify-code
    // Called from the frontend when the user enters the 6-digit code
    public function verifyCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code'  => 'required|string|size:6',
        ]);

        // First try existing users (legacy flow)
        $user = User::where('email', $request->email)
            ->where('email_verification_code', $request->code)
            ->first();

        if ($user) {
            if ($user->hasVerifiedEmail()) {
                return $this->errorResponse('Cet email est déjà vérifié.', 400);
            }
            if ($user->email_verification_sent_at->lt(now()->subMinutes(60))) {
                return $this->errorResponse('Le code de vérification a expiré.', 400);
            }
            $user->update([
                'email_verified_at' => now(),
                'email_verification_code' => null,
                'email_verification_sent_at' => null,
            ]);
            return $this->successResponse(null, 'Votre email a été vérifié avec succès.');
        }

        // Then try pending registrations
        $pending = PendingRegistration::where('email', $request->email)
            ->where('email_verification_code', $request->code)
            ->first();

        if (!$pending) {
            return $this->errorResponse('Code de vérification invalide.', 400);
        }

        if ($pending->email_verification_sent_at && $pending->email_verification_sent_at->lt(now()->subMinutes(60))) {
            return $this->errorResponse('Le code de vérification a expiré.', 400);
        }

        // Create the real user account now that email is verified
        $newUser = User::create([
            'email' => $pending->email,
            'phone' => $pending->phone,
            'password_hash' => $pending->password_hash,
            'full_name' => $pending->full_name,
            'avatar_path' => $pending->avatar_path,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Delete pending registration
        $pending->delete();

        AuditLog::log('signup_completed', $newUser->id);

        // Dispatch the registration event
        UserRegisteredEvent::dispatch($newUser);

        return $this->successResponse(null, 'Votre email a été vérifié et le compte est créé.');
    }

    // POST /api/v1/email/resend
    public function resend(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // If a pending registration exists, resend to it; otherwise return success to avoid enumeration
            $pending = PendingRegistration::where('email', $request->email)->first();
            if (!$pending) {
                return $this->successResponse(null, 'Si un compte existe avec cet email, un code de vérification a été envoyé.');
            }

            if ($pending->email_verification_sent_at
                && $pending->email_verification_sent_at->gt(now()->subMinutes(2))) {
                return $this->errorResponse('Veuillez attendre avant de redemander un code de vérification.', 429);
            }

            $code = $pending->generateVerificationCode();
            $pending->notify(new VerifyEmailNotification($code));

            return $this->successResponse(null, 'Code de vérification envoyé.');
        }

        if ($user->hasVerifiedEmail()) {
            return $this->errorResponse('Cet email est déjà vérifié.', 400);
        }

        // Throttle: do not resend if last email was sent less than 2 minutes ago
        if ($user->email_verification_sent_at
            && $user->email_verification_sent_at->gt(now()->subMinutes(2))) {
            return $this->errorResponse('Veuillez attendre avant de redemander un code de vérification.', 429);
        }

        $code = $user->generateVerificationCode();
        $user->notify(new VerifyEmailNotification($code));

        return $this->successResponse(null, 'Code de vérification envoyé.');
    }
}
