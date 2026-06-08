<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Transaction extends Model
{
    /**
 * @property int $id
 * @property string $uuid
 * @property string|null $payment_intent_id
 * @property int $user_id
 * @property string $type
 * @property string $status
 * @property string $amount
 * @property string $currency
 * @property string|null $balance_before
 * @property string|null $balance_after
 * @property string|null $payment_method
 * @property string|null $reference
 * @property array|null $metadata
 * @property string|null $created_at
 * @property-read \App\Models\User|null $user
 *
 * @use HasFactory<\Database\Factories\TransactionFactory>
 */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'uuid',
        'payment_intent_id',
        'user_id',
        'type',
        'status',
        'amount',
        'currency',
        'balance_before',
        'balance_after',
        'payment_method',
        'reference',
        'payment_intent_id',
        'metadata',
    ];

    /**
     * Get the user that owns the transaction.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @var bool
     */
    public $timestamps = false;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'balance_before' => 'decimal:2',
            'balance_after' => 'decimal:2',
            'metadata' => 'array',
            'created_at' => 'datetime',
        ];
    }

    /**
     * The UUID of the transaction.
     *
     * @var string|null
     */
    protected $uuid;

    protected static function booted(): void
    {
        static::creating(function (Transaction $transaction): void {
            if (empty($transaction->uuid)) {
                $transaction->uuid = (string) Str::uuid();
            }
        });
    }
}
