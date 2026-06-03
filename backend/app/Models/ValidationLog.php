<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ValidationLog extends Model
{
    /** @use HasFactory<\Database\Factories\ValidationLogFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'ticket_id',
        'user_id',
        'validator_id',
        'validation_type',
        'status',
        'failure_reason',
        'location',
        'metadata',
    ];

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
            'location' => 'array',
            'metadata' => 'array',
            'created_at' => 'datetime',
        ];
    }
}
