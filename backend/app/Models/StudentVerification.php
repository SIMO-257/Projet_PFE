<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentVerification extends Model
{
    protected $table = 'student_verifications';

    protected $fillable = [
        'user_id',
        'cin_doc_path',
        'school_doc_path',
        'status',
        'admin_id',
        'rejected_reason',
    ];

    protected function casts(): array
    {
        return [
            'status' => 'string',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }
}
