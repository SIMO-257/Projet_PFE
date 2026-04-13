<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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
        'avatar',
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

    protected $appends = [
        'avatar_url',
    ];

    public function avatarKey(string $extension): string
    {
        $ext = strtolower(trim($extension)) ?: 'jpg';
        return "avatars/clients/{$this->uuid}/avatar.{$ext}";
    }

    public function storeAvatar(UploadedFile $file, ?string $disk = null): string
    {
        $diskName = $disk ?: config('filesystems.default');
        $key = $this->avatarKey($file->extension() ?: 'jpg');

        Storage::disk($diskName)->putFileAs(dirname($key), $file, basename($key));

        $this->avatar = $key;
        $this->save();

        return $key;
    }

    public function getAvatarUrlAttribute(): ?string
    {
        $avatar = (string) ($this->avatar ?? '');
        if ($avatar === '') {
            return null;
        }

        if (preg_match('/^https?:\\/\\//i', $avatar)) {
            return $avatar;
        }

        $base = rtrim((string) env('AVATAR_BASE_URL', ''), '/');
        if ($base === '') {
            return $avatar;
        }

        return $base.'/'.ltrim($avatar, '/');
    }

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
