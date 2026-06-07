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
use App\Notifications\PinResetNotification;

class User extends Authenticatable implements CanResetPasswordContract, MustVerifyEmail
{
    /**
     * @property int $id
     * @property string $uuid
     * @property string $email
     * @property string|null $phone
     * @property string $password_hash
     * @property string|null $pin_hash
     * @property string $full_name
     * @property string|null $avatar_path
     * @property bool $is_active
     * @property bool $is_student
     * @property string|null $last_active_at
     * @property int|null $default_ticket_id
     * @property array|null $notification_prefs
     * @property array|null $user_preferences
     * @property string|null $email_verification_token
     * @property string|null $email_verification_code
     * @property string|null $email_verification_sent_at
     * @property string|null $email_verified_at
     * @property string|null $fcm_token
     * @property string|null $recovery_email
     * @property string|null $recovery_email_verified_at
     * @property string|null $created_at
     *
     * @use HasFactory<\Database\Factories\UserFactory>
     */
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
        'pin_hash',
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
        'is_student',
        'recovery_email',
        'recovery_email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password_hash',
        'pin_hash',
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
            'is_student' => 'boolean',
            'created_at' => 'datetime',
            'last_active_at' => 'datetime',
            'notification_prefs' => 'array',
            'user_preferences' => 'array',
            'email_verified_at'           => 'datetime',
            'email_verification_sent_at'  => 'datetime',
            'recovery_email_verified_at'  => 'datetime',
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
        $token = password_hash($this->email . $this->created_at . random_bytes(16), PASSWORD_BCRYPT);
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
