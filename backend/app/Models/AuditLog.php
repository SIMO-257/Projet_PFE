<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $fillable = [
        'user_id',
        'action',
        'ip_address',
        'user_agent',
        'metadata',
    ];

    public $timestamps = false;

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class, 'user_id');
    }

    /**
     * Helper to log an action.
     */
    public static function log($action, $userId = null, $metadata = [])
    {
        return self::create([
            'user_id' => $userId ?? (auth()->check() ? auth()->id() : null),
            'action' => $action,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata' => $metadata,
        ]);
    }
}
