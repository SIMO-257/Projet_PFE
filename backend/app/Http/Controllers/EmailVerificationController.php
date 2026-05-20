<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Client;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    // GET /email/verify/{token}
    // Called when the client clicks the link in the email
    // This is a WEB route (not API) — it redirects to the frontend
    public function verify(string $token)
    {
        // First try existing clients
        $client = Client::where('email_verification_token', $token)->first();
        if ($client) {
            if ($client->hasVerifiedEmail()) {
                return redirect(config('app.frontend_url') . '/verify-email?status=already_verified');
            }
            if ($client->email_verification_sent_at->lt(now()->subMinutes(60))) {
                return redirect(config('app.frontend_url') . '/verify-email?status=expired&email=' . urlencode($client->email));
            }
            $client->update([
                'email_verified_at' => now(),
                'email_verification_token' => null,
                'email_verification_sent_at' => null,
            ]);
            return redirect(config('app.frontend_url') . '/verify-email?status=success');
        }

        // Then try pending registrations
        $pending = \App\Models\PendingRegistration::where('email_verification_token', $token)->first();
        if (!$pending) {
            return redirect(config('app.frontend_url') . '/verify-email?status=invalid');
        }
        if ($pending->email_verification_sent_at && $pending->email_verification_sent_at->lt(now()->subMinutes(60))) {
            return redirect(config('app.frontend_url') . '/verify-email?status=expired&email=' . urlencode($pending->email));
        }

        // Create the real client
        $newClient = Client::create([
            'email' => $pending->email,
            'phone' => $pending->phone,
            'password_hash' => $pending->password_hash,
            'full_name' => $pending->full_name,
            'avatar_path' => $pending->avatar_path,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $pending->delete();

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

        // First try existing clients (legacy flow)
        $client = Client::where('email', $request->email)
            ->where('email_verification_code', $request->code)
            ->first();

        if ($client) {
            if ($client->hasVerifiedEmail()) {
                return $this->errorResponse('Cet email est déjà vérifié.', 400);
            }
            if ($client->email_verification_sent_at->lt(now()->subMinutes(60))) {
                return $this->errorResponse('Le code de vérification a expiré.', 400);
            }
            $client->update([
                'email_verified_at' => now(),
                'email_verification_code' => null,
                'email_verification_sent_at' => null,
            ]);
            return $this->successResponse(null, 'Votre email a été vérifié avec succès.');
        }

        // Then try pending registrations
        $pending = \App\Models\PendingRegistration::where('email', $request->email)
            ->where('email_verification_code', $request->code)
            ->first();

        if (!$pending) {
            return $this->errorResponse('Code de vérification invalide.', 400);
        }

        if ($pending->email_verification_sent_at && $pending->email_verification_sent_at->lt(now()->subMinutes(60))) {
            return $this->errorResponse('Le code de vérification a expiré.', 400);
        }

        // Create the real client account now that email is verified
        $newClient = Client::create([
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

        AuditLog::log('signup_completed', $newClient->id);

        return $this->successResponse(null, 'Votre email a été vérifié et le compte est créé.');
    }

    // POST /api/v1/email/resend
    public function resend(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $client = Client::where('email', $request->email)->first();

        if (!$client) {
            // If a pending registration exists, resend to it; otherwise return success to avoid enumeration
            $pending = \App\Models\PendingRegistration::where('email', $request->email)->first();
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

        if ($client->hasVerifiedEmail()) {
            return $this->errorResponse('Cet email est déjà vérifié.', 400);
        }

        // Throttle: do not resend if last email was sent less than 2 minutes ago
        if ($client->email_verification_sent_at
            && $client->email_verification_sent_at->gt(now()->subMinutes(2))) {
            return $this->errorResponse('Veuillez attendre avant de redemander un code de vérification.', 429);
        }

        $code = $client->generateVerificationCode();
        $client->notify(new VerifyEmailNotification($code));

        return $this->successResponse(null, 'Code de vérification envoyé.');
    }
}
