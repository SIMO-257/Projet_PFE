<?php

namespace App\Models;

use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Notifications\ResetPasswordNotification;

class User extends Authenticatable implements CanResetPasswordContract, MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, CanResetPassword;

    protected $table = 'users';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'uuid',
        'email',
        'phone',
        'password_hash',
        'full_name',
        'avatar_path',
        'is_active',
        'last_active_at',
        'default_ticket_id',
        'notification_prefs',
        'user_preferences',
        'email_verification_token',
        'email_verification_code',
        'email_verification_sent_at',
        'email_verified_at',
        'fcm_token',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password_hash',
        'profile_file',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'created_at' => 'datetime',
            'last_active_at' => 'datetime',
            'notification_prefs' => 'array',
            'user_preferences' => 'array',
            'email_verified_at'           => 'datetime',
            'email_verification_sent_at'  => 'datetime',
        ];
    }

    /**
     * This table only has created_at; disable default timestamps.
     *
     * @var bool
     */
    public $timestamps = true;

    protected static function booted(): void
    {
        static::creating(function (User $user): void {
            if (empty($user->uuid)) {
                $user->uuid = (string) Str::uuid();
            }
        });
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
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
        return $this->belongsTo(Ticket::class, 'default_ticket_id');
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
