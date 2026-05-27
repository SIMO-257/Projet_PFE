<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StudentVerification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminStudentVerificationController extends Controller
{
    /**
     * GET /api/admin/student-verifications?status=
     * List all student verification requests with optional status filter.
     */
    public function index(Request $request)
    {
        $query = StudentVerification::with('user:id,full_name,email,is_student');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $verifications = $query->orderBy('created_at', 'desc')->paginate(20);

        // Counts by status
        $counts = [
            'pending'  => StudentVerification::where('status', 'pending')->count(),
            'approved' => StudentVerification::where('status', 'approved')->count(),
            'rejected' => StudentVerification::where('status', 'rejected')->count(),
        ];

        return response()->json([
            'status' => 'success',
            'data'   => $verifications,
            'counts' => $counts,
        ]);
    }

    /**
     * GET /api/admin/student-verifications/{id}
     * Show full details of a verification request including document URLs.
     */
    public function show($id)
    {
        $verification = StudentVerification::with('user:id,full_name,email,phone,is_student,created_at')->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data'   => [
                'id'                 => $verification->id,
                'user_id'            => $verification->user_id,
                'status'             => $verification->status,
                'rejected_reason'    => $verification->rejected_reason,
                'created_at'         => $verification->created_at->toDateTimeString(),
                'updated_at'         => $verification->updated_at?->toDateTimeString(),
                'user'               => $verification->user ? [
                    'id'         => $verification->user->id,
                    'full_name'  => $verification->user->full_name,
                    'email'      => $verification->user->email,
                    'phone'      => $verification->user->phone,
                    'is_student' => (bool) $verification->user->is_student,
                    'member_since' => $verification->user->created_at->toDateString(),
                ] : null,
                'document_urls'      => [
                    'cin_doc'    => $verification->cin_doc_path ? Storage::disk('public')->url($verification->cin_doc_path) : null,
                    'school_doc' => $verification->school_doc_path ? Storage::disk('public')->url($verification->school_doc_path) : null,
                ],
            ],
        ]);
    }

    /**
     * POST /api/admin/student-verifications/{id}/approve
     * Approve a student verification request.
     */
    public function approve(Request $request, $id)
    {
        $verification = StudentVerification::findOrFail($id);

        if ($verification->status !== 'pending') {
            return response()->json([
                'status'  => 'error',
                'message' => 'Cette demande a déjà été traitée (statut : ' . $verification->status . ').',
            ], 422);
        }

        $user = User::findOrFail($verification->user_id);

        $verification->update([
            'status'   => 'approved',
            'admin_id' => $request->user()->id,
        ]);

        $user->update(['is_student' => true]);

        // Log the action
        \Illuminate\Support\Facades\Log::info('Student verification approved', [
            'verification_id' => $verification->id,
            'user_id' => $user->id,
            'admin_id' => $request->user()->id,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Vérification approuvée. L\'utilisateur est désormais un étudiant.',
            'data'    => [
                'id'     => $verification->id,
                'status' => $verification->status,
            ],
        ]);
    }

    /**
     * POST /api/admin/student-verifications/{id}/reject
     * Reject a student verification request with a reason.
     */
    public function reject(Request $request, $id)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $verification = StudentVerification::findOrFail($id);

        if ($verification->status !== 'pending') {
            return response()->json([
                'status'  => 'error',
                'message' => 'Cette demande a déjà été traitée (statut : ' . $verification->status . ').',
            ], 422);
        }

        $verification->update([
            'status'          => 'rejected',
            'admin_id'        => request()->user()->id,
            'rejected_reason' => $validated['reason'],
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Demande rejetée.',
            'data'    => [
                'id'     => $verification->id,
                'status' => $verification->status,
            ],
        ]);
    }
}
