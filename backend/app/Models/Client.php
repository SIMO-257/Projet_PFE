<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Client extends Model
{
    /** @use HasFactory<\Database\Factories\ClientFactory> */
    use HasFactory;

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
            'created_at' => 'datetime',
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
}
