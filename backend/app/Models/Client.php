<?php

namespace App\Models;

use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Notifications\ClientResetPasswordNotification;

class Client extends Authenticatable implements CanResetPasswordContract
{
    /** @use HasFactory<\Database\Factories\ClientFactory> */
    use HasApiTokens, HasFactory, Notifiable, CanResetPassword;

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
        'first_name',
        'last_name',
        'profile_file',
        'is_active',
        'remember_me',
        'default_ticket_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password_hash',
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
            'remember_me' => 'boolean',
            'created_at' => 'datetime',
            'password_hash' => 'hashed',
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
        static::creating(function (Client $client): void {
            if (empty($client->uuid)) {
                $client->uuid = (string) Str::uuid();
            }
        });
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ClientResetPasswordNotification($token));
    }

    /**
     * Use password_hash as the auth password field.
     */
    public function getAuthPassword(): string
    {
        return (string) $this->password_hash;
    }

    /**
     * Get the wallet associated with the client.
     */
    public function wallet()
    {
        return $this->hasOne(Wallet::class, 'user_id');
    }

    /**
     * Get the transactions for the client.
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'user_id');
    }

    public function defaultTicket()
    {
        return $this->belongsTo(Ticket::class, 'default_ticket_id');
    }
}
