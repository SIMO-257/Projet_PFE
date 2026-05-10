<?php

namespace App\Http\Controllers;

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
        $client = Client::where('email_verification_token', $token)->first();

        if (!$client) {
            // Token not found — redirect to frontend error page
            return redirect(config('app.frontend_url') . '/verify-email?status=invalid');
        }

        if ($client->hasVerifiedEmail()) {
            // Already verified — redirect to frontend already-verified page
            return redirect(config('app.frontend_url') . '/verify-email?status=already_verified');
        }

        // Check if token is older than 60 minutes
        if ($client->email_verification_sent_at->lt(now()->subMinutes(60))) {
            return redirect(config('app.frontend_url') . '/verify-email?status=expired&email=' . urlencode($client->email));
        }

        // Mark as verified
        $client->update([
            'email_verified_at'           => now(),
            'email_verification_token'    => null,
            'email_verification_sent_at'  => null,
        ]);

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

        $client = Client::where('email', $request->email)
            ->where('email_verification_code', $request->code)
            ->first();

        if (!$client) {
            return $this->errorResponse('Code de vérification invalide.', 400);
        }

        if ($client->hasVerifiedEmail()) {
            return $this->errorResponse('Cet email est déjà vérifié.', 400);
        }

        // Check if code is older than 60 minutes
        if ($client->email_verification_sent_at->lt(now()->subMinutes(60))) {
            return $this->errorResponse('Le code de vérification a expiré.', 400);
        }

        // Mark as verified
        $client->update([
            'email_verified_at'           => now(),
            'email_verification_code'     => null,
            'email_verification_sent_at'  => null,
        ]);

        return $this->successResponse(null, 'Votre email a été vérifié avec succès.');
    }

    // POST /api/v1/email/resend
    // Resends the verification email — auth:sanctum NOT required
    // Rate limited: max 3 attempts per hour per email
    public function resend(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $client = Client::where('email', $request->email)->first();

        if (!$client) {
            // Return success even if not found — prevents email enumeration attack
            return $this->successResponse(null, 'Si un compte existe avec cet email, un code de vérification a été envoyé.');
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
