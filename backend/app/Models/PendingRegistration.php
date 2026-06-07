<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class PendingRegistration extends Model
{
    use Notifiable;

    protected $table = 'pending_registrations';

    protected $fillable = [
        'email', 'phone', 'password_hash', 'full_name', 'avatar_path',
        'email_verification_code', 'email_verification_token', 'email_verification_sent_at',
    ];

    protected $casts = [
        'email_verification_sent_at' => 'datetime',
    ];

    public function generateVerificationCode(): string
    {
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $this->update([
            'email_verification_code' => $code,
            'email_verification_sent_at' => now(),
            'email_verification_token' => password_hash($this->email . now() . random_bytes(16), PASSWORD_BCRYPT),
        ]);
        return $code;
    }
}
