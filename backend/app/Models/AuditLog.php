<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

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
        try {
            $request = request();

            return self::create([
                'user_id' => $userId ?? (auth()->check() ? auth()->id() : null),
                'action' => $action,
                'ip_address' => app()->runningInConsole() ? null : $request->ip(),
                'user_agent' => app()->runningInConsole() ? null : $request->userAgent(),
                'metadata' => $metadata,
            ]);
        } catch (\Throwable $e) {
            // Never let audit logging break business-critical flows.
            Log::warning('Audit log write failed', [
                'action' => $action,
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }
}
