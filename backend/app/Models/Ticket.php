<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class Ticket extends Model
{
    /**
 * @property int $id
 * @property string $uuid
 * @property int $user_id
 * @property int|null $ticket_type_id
 * @property int|null $purchase_id
 * @property string $status
 * @property string|null $valid_from
 * @property string|null $valid_until
 * @property int $remaining_uses
 * @property string|null $price_paid
 * @property string|null $created_at
 * @property string|null $updated_at
 * @property-read \App\Models\TicketType|null $ticketType
 * @property-read \App\Models\User|null $user
 *
 * @use HasFactory<\Database\Factories\TicketFactory>
 */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'uuid',
        'user_id',
        'ticket_type_id',
        'purchase_id',
        'status',
        'valid_from',
        'valid_until',
        'remaining_uses',
        'price_paid',
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

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * The UUID of the ticket.
     *
     * @var string|null
     */
    protected ?string $uuid = null;

    protected static function booted(): void
    {
        static::creating(function (Ticket $ticket): void {
            if (empty($ticket->uuid)) {
                $ticket->uuid = (string) Str::uuid();
            }
        });
    }
}
