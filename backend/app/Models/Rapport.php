<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rapport extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'type_probleme',
        'sujet',
        'description',
        'statut',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'user_id');
    }
}
