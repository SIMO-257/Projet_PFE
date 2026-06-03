<?php

namespace App\Http\Controllers;

use App\Models\StudentVerification;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StudentVerificationController extends Controller
{
    /**
     * Get the student verification status for the authenticated user.
     */
    public function studentStatus(Request $request)
    {
        $user = $request->user();
        $verification = StudentVerification::where('user_id', $user->id)->first();

        return $this->successResponse([
            'is_student' => (bool) $user->is_student,
            'verification' => $verification ? [
                'id' => $verification->id,
                'status' => $verification->status,
                'created_at' => $verification->created_at->toDateTimeString(),
            ] : null,
        ]);
    }

    /**
     * Submit student verification documents.
     */
    public function submitStudentVerification(Request $request)
    {
        $user = $request->user();

        if ($user->is_student) {
            return $this->errorResponse('You are already verified as a student.', 422);
        }

        $existing = StudentVerification::where('user_id', $user->id)->first();
        if ($existing && $existing->status !== 'rejected') {
            return $this->errorResponse('A verification request already exists with status: ' . $existing->status, 422);
        }

        $validated = $request->validate([
            'cin_doc' => 'required|file|mimes:pdf,doc,docx|max:10240',
            'school_doc' => 'required|file|mimes:pdf,doc,docx|max:10240',
        ]);

        $cinPath = $request->file('cin_doc')->store('student_cin', 'spaces');
        $schoolPath = $request->file('school_doc')->store('student_school', 'spaces');

        if ($existing) {
            Storage::disk('spaces')->delete($existing->cin_doc_path);
            Storage::disk('spaces')->delete($existing->school_doc_path);

            $existing->update([
                'cin_doc_path' => $cinPath,
                'school_doc_path' => $schoolPath,
                'status' => 'pending',
                'admin_id' => null,
                'rejected_reason' => null,
            ]);

            $verification = $existing;
        } else {
            $verification = StudentVerification::create([
                'user_id' => $user->id,
                'cin_doc_path' => $cinPath,
                'school_doc_path' => $schoolPath,
                'status' => 'pending',
            ]);
        }

        AuditLog::log('student_verification_submitted', $user->id);

        return $this->successResponse([
            'id' => $verification->id,
            'status' => $verification->status,
        ], 'Documents submitted successfully. Awaiting verification.', 201);
    }
}
