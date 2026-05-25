<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Jobs\SendAdminNotificationJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminNotificationController extends Controller
{
    // POST /api/admin/notifications/send
    public function send(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'title'     => 'required|string|max:100',
            'body'      => 'required|string|max:255',
            'type'      => 'required|in:validation,payment,security,promo,system',
            'target'    => 'required|in:all,single',
            'user_id' => 'required_if:target,single|nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            Log::warning('Notification Validation Failed', [
                'errors' => $validator->errors()->toArray(),
                'request' => $request->all()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->target === 'all') {
            // Dispatch a queued job per user to avoid timeout with thousands of users
            User::chunk(100, function ($users) use ($request) {
                foreach ($users as $user) {
                    SendAdminNotificationJob::dispatch(
                        $user->id,
                        $request->type,
                        $request->title,
                        $request->body,
                    );
                }
            });

            $count = User::count();
            return response()->json([
                'status' => 'success',
                'message' => "Notification en cours d'envoi à {$count} utilisateurs (tâches en file d'attente).",
            ]);
        }

        // Single user — dispatch job as well for consistency
        $user = User::findOrFail($request->user_id);
        SendAdminNotificationJob::dispatch(
            $user->id,
            $request->type,
            $request->title,
            $request->body,
        );

        return response()->json([
            'status' => 'success',
            'message' => "Notification en cours d'envoi à {$user->email}.",
        ]);
    }
}
