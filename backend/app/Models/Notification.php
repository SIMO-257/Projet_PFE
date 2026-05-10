<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id', 'type', 'severity', 'title', 'body', 'meta', 'is_read', 'read_at',
    ];

    protected $casts = [
        'meta'     => 'array',
        'is_read'  => 'boolean',
        'read_at'  => 'datetime',
    ];

    // Relationships
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'user_id');
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeOfType($query, string $type)
    {
        if ($type === 'all') {
            return $query;
        }
        return $query->where('type', $type);
    }

    // Actions
    public function markRead(): void
    {
        $this->update(['is_read' => true, 'read_at' => now()]);
    }
}
