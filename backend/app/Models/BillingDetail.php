<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillingDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'address',
        'tax_id',
        'country',
    ];

    protected $casts = [
        'address' => 'array',
    ];

    /**
     * Get the client that owns the billing details.
     */
    public function client()
    {
        return $this->belongsTo(Client::class, 'user_id');
    }
}
