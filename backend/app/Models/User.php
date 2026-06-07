    <?php

    namespace App\Models;

    use Illuminate\Foundation\Auth\User as Authenticatable;
    use Illuminate\Notifications\Notifiable;

    class User extends Authenticatable
    {
        use Notifiable;

        /**
         * The default ticket id for the user.
         *
         * @var int|null
         */
        protected ?int $default_ticket_id = null;

        /**
         * The attributes that are mass assignable.
         *
         * @var array<int, string>
         */
        protected $fillable = [
            'name',
            'email',
            'password',
            'default_ticket_id',
        ];

        /**
         * The attributes that should be hidden for serialization.
         *
         * @var array<int, string>
         */
        protected $hidden = [
            'password',
            'remember_token',
        ];

        /**
         * The attributes that should be cast.
         *
         * @var array<string, string>
         */
        protected $casts = [
            'email_verified_at' => 'datetime',
            'default_ticket_id'  => 'integer',
        ];

        // ... other model methods and relationships ...
    }
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    /**
     * Redirect PIN reset notifications to recovery email if set.
     */
    public function routeNotificationForMail(\Illuminate\Notifications\Notification $notification): array|string
    {
        // If this is a PIN reset notification AND recovery email is set, use that
        if ($notification instanceof PinResetNotification && !empty($this->recovery_email)) {
            return $this->recovery_email;
        }

        // Default: use the primary email
        return $this->email;
    }

    /**
     * Use password_hash as the auth password field.
     */
    public function getAuthPassword(): string
    {
        return (string) $this->password_hash;
    }

    /**
     * Get the wallet associated with the user.
     */
    public function wallet()
    {
        return $this->hasOne(Wallet::class, 'user_id');
    }

    /**
     * Get the transactions for the user.
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'user_id');
    }

    /**
     * Get the tickets for the user.
     */
    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'user_id');
    }

    public function defaultTicket()
    {
        return $this->hasOne(Ticket::class, 'id', 'default_ticket_id');
    }

    /**
     * Get the student verification record.
     */
    public function studentVerification()
    {
        return $this->hasOne(StudentVerification::class, 'user_id');
    }

    // Check if email is verified
    public function hasVerifiedEmail(): bool
    {
        return !is_null($this->email_verified_at);
    }

    // Generate and store a new verification token
    public function generateVerificationToken(): string
    {
        $token = sha1($this->email . $this->created_at . random_bytes(16));
        $this->update([
            'email_verification_token'  => $token,
            'email_verification_sent_at' => now(),
        ]);
        return $token;
    }

    // Generate and store a new 6-digit verification code
    public function generateVerificationCode(): string
    {
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $this->update([
            'email_verification_code'    => $code,
            'email_verification_sent_at'  => now(),
        ]);
        return $code;
    }
}
