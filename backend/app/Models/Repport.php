<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Repport extends Model
{
    protected $table = 'repports';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'type_probleme',
        'sujet',
        'description',
        'image_path',
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
        return $this->belongsTo(User::class, 'user_id');
    }
}
