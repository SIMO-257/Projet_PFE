<?php

namespace App\Http\Controllers;

use App\Notifications\PinResetNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class UserPinController extends Controller
{
    /**
     * Set or change the PIN.
     * Requires the account password to confirm identity.
     *
     * POST /api/users/pin/set
     */
    public function set(Request $request)
    {
        $validated = $request->validate([
            'pin'           => 'required|string|digits_between:4,8',
            'current_password' => 'required|string',
        ]);

        $user = $request->user();

        // Verify account password first
        if (!Hash::check($validated['current_password'], $user->password_hash)) {
            throw ValidationException::withMessages([
                'current_password' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

        // Check PIN complexity — disallow trivial sequences
        $pin = $validated['pin'];
        if ($this->isTrivialPin($pin)) {
            return $this->errorResponse('Ce code PIN est trop simple. Choisissez un code plus sécurisé (pas de séquences évidentes).', 422);
        }

        $user->pin_hash = Hash::make($pin);
        $user->save();

        // Also enable pin_enabled in preferences
        $prefs = $user->user_preferences ?? [];
        $prefs['pin_enabled'] = true;
        $user->user_preferences = $prefs;
        $user->save();

        return $this->successResponse(null, 'Code PIN créé avec succès.');
    }

    /**
     * Verify the PIN.
     * Returns a short-lived verification token that the frontend can use.
     *
     * POST /api/users/pin/verify
     */
    public function verify(Request $request)
    {
        $validated = $request->validate([
            'pin' => 'required|string',
        ]);

        $user = $request->user();

        if (empty($user->pin_hash)) {
            return $this->errorResponse('Aucun code PIN configuré.', 400);
        }

        if (!Hash::check($validated['pin'], $user->pin_hash)) {
            // Log failed attempt (optional)
            return $this->errorResponse('Code PIN incorrect.', 422);
        }

        // Revoke old PIN tokens first to avoid accumulation
        $user->tokens()->where('name', 'pin_verification')->delete();

        // Generate a short-lived verification token (expires in 5 minutes)
        $pinToken = $user->createToken('pin_verification', ['*'], now()->addMinutes(5))->plainTextToken;

        return $this->successResponse([
            'pin_verified'  => true,
            'pin_token'     => $pinToken,
            'expires_in'    => 300, // 5 minutes in seconds
        ], 'Code PIN vérifié.');
    }

    /**
     * Disable the PIN.
     * Requires the current PIN to disable.
     *
     * POST /api/users/pin/disable
     */
    public function disable(Request $request)
    {
        $validated = $request->validate([
            'pin' => 'required|string',
        ]);

        $user = $request->user();

        if (empty($user->pin_hash)) {
            return $this->errorResponse('Aucun code PIN configuré.', 400);
        }

        if (!Hash::check($validated['pin'], $user->pin_hash)) {
            return $this->errorResponse('Code PIN incorrect.', 422);
        }

        // Clear the PIN hash and disable in preferences
        $user->pin_hash = null;
        $prefs = $user->user_preferences ?? [];
        $prefs['pin_enabled'] = false;
        $user->user_preferences = $prefs;
        $user->save();

        // Revoke any active PIN verification tokens
        $user->tokens()->where('name', 'pin_verification')->delete();

        return $this->successResponse(null, 'Code PIN désactivé.');
    }

    /**
     * Get PIN status (whether a PIN is set).
     *
     * GET /api/users/pin/status
     */
    public function status(Request $request)
    {
        $user = $request->user();
        $prefs = $user->user_preferences ?? [];

        return $this->successResponse([
            'pin_set'       => !empty($user->pin_hash),
            'pin_enabled'   => $prefs['pin_enabled'] ?? !empty($user->pin_hash),
        ]);
    }

    /**
     * Reset the PIN (recovery).
     * Requires the account password to confirm identity.
     * Generates a new random PIN and sends it via email.
     *
     * POST /api/users/pin/reset
     */
    public function reset(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
        ]);

        $user = $request->user();

        // Verify account password first
        if (!Hash::check($validated['current_password'], $user->password_hash)) {
            throw ValidationException::withMessages([
                'current_password' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

        // Generate a new random 4-digit PIN (avoid trivial sequences)
        $newPin = $this->generateSecurePin();

        // Store the new PIN hash
        $user->pin_hash = Hash::make($newPin);
        $user->save();

        // Also enable pin_enabled in preferences
        $prefs = $user->user_preferences ?? [];
        $prefs['pin_enabled'] = true;
        $user->user_preferences = $prefs;
        $user->save();

        // Send the new PIN via email (will use recovery_email if set, thanks to routeNotificationForMail)
        $user->notify(new PinResetNotification($newPin));

        // Determine which email to show as masked
        $maskedEmail = !empty($user->recovery_email)
            ? $this->maskEmail($user->recovery_email)
            : $this->maskEmail($user->email);

        $message = !empty($user->recovery_email)
            ? 'Un nouveau code PIN a été envoyé à votre email de récupération.'
            : 'Un nouveau code PIN a été envoyé par email.';

        return $this->successResponse([
            'method' => 'email',
            'masked' => $maskedEmail,
        ], $message);
    }

    /**
     * Set or update the recovery email.
     * Requires current password + current PIN to confirm identity.
     *
     * POST /api/users/pin/recovery-email
     */
    public function setRecoveryEmail(Request $request)
    {
        $validated = $request->validate([
            'email'           => 'required|email|max:255',
            'current_password' => 'required|string',
            'pin'             => 'required|string',
        ]);

        $user = $request->user();

        // Verify account password
        if (!Hash::check($validated['current_password'], $user->password_hash)) {
            throw ValidationException::withMessages([
                'current_password' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

        // Verify current PIN
        if (empty($user->pin_hash) || !Hash::check($validated['pin'], $user->pin_hash)) {
            throw ValidationException::withMessages([
                'pin' => ['Le code PIN est incorrect.'],
            ]);
        }

        // Check that recovery email is different from primary email
        if (strtolower($validated['email']) === strtolower($user->email)) {
            throw ValidationException::withMessages([
                'email' => ['L\'email de récupération doit être différent de votre email principal.'],
            ]);
        }

        // Save recovery email
        $user->recovery_email = $validated['email'];
        $user->recovery_email_verified_at = now();
        $user->save();

        return $this->successResponse([
            'masked' => $this->maskEmail($user->recovery_email),
        ], 'Email de récupération enregistré avec succès.');
    }

    /**
     * Get the current recovery email (masked).
     *
     * GET /api/users/pin/recovery-email
     */
    public function getRecoveryEmail(Request $request)
    {
        $user = $request->user();

        if (empty($user->recovery_email)) {
            return $this->successResponse([
                'masked' => null,
            ]);
        }

        return $this->successResponse([
            'masked' => $this->maskEmail($user->recovery_email),
        ]);
    }

    /**
     * Generate a secure random 4-digit PIN that is not a trivial sequence.
     */
    private function generateSecurePin(): string
    {
        do {
            $pin = str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        } while ($this->isTrivialPin($pin));
        return $pin;
    }

    /**
     * Mask an email for display (e.g., j***@example.com).
     */
    private function maskEmail(?string $email): string
    {
        if (!$email) return '';
        $parts = explode('@', $email);
        $name = $parts[0];
        $domain = $parts[1] ?? '';
        $masked = substr($name, 0, 1) . str_repeat('*', max(0, strlen($name) - 1));
        return $masked . '@' . $domain;
    }

    /**
     * Check if a PIN is a trivial sequence.
     */
    private function isTrivialPin(string $pin): bool
    {
        // Repeating digits: 1111, 2222, etc.
        if (preg_match('/^(\d)\1{3,}$/', $pin)) {
            return true;
        }

        // Sequential ascending: 1234, 2345, etc.
        $ascending = true;
        for ($i = 1; $i < strlen($pin); $i++) {
            if ((int)$pin[$i] !== ((int)$pin[$i - 1] + 1) % 10) {
                $ascending = false;
                break;
            }
        }
        if ($ascending) return true;

        // Sequential descending: 4321, 5432, etc.
        $descending = true;
        for ($i = 1; $i < strlen($pin); $i++) {
            $prev = (int)$pin[$i - 1];
            $curr = (int)$pin[$i];
            // Handle wrap: 0 after 1? No, descending: 9->8, 8->7, ..., 1->0
            $expected = ($prev === 0) ? 9 : $prev - 1;
            if ($curr !== $expected) {
                $descending = false;
                break;
            }
        }
        if ($descending) return true;

        return false;
    }
}
