<?php

namespace App\Http\Controllers;

use App\Models\TicketType;
use Illuminate\Support\Facades\Auth;

class TicketTypeController extends Controller
{
    /**
     * Get all active ticket types with effective price (student discount if applicable).
     */
    public function index()
    {
        $user = Auth::user();
        $types = TicketType::where('is_active', true)->get()->map(function ($type) use ($user) {
            $isStudent = $user && $user->is_student;
            $type->effective_price = $isStudent && $type->student_price !== null
                ? (float) $type->student_price
                : (float) $type->price;
            return $type;
        });

        return $this->successResponse($types);
    }
}
