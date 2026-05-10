<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class Ticket extends Model
{
    /** @use HasFactory<\Database\Factories\TicketFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'uuid',
        'secure_token',
        'user_id',
        'ticket_type_id',
        'purchase_id',
        'status',
        'valid_from',
        'valid_until',
        'remaining_uses',
        'price_paid',
        'jws_signature',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'valid_from' => 'datetime',
            'valid_until' => 'datetime',
            'remaining_uses' => 'integer',
            'price_paid' => 'decimal:2',
        ];
    }

    public function ticketType()
    {
        return $this->belongsTo(TicketType::class, 'ticket_type_id');
    }

    protected static function booted(): void
    {
        static::creating(function (Ticket $ticket): void {
            if (empty($ticket->uuid)) {
                $ticket->uuid = (string) Str::uuid();
            }

            // Generate secure token using HMAC-SHA256
            if (empty($ticket->secure_token)) {
                $ticket->secure_token = hash_hmac('sha256', $ticket->uuid, config('app.key'));
            }
        });
    }
}
