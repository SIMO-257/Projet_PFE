<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Client;
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
            'client_id' => 'required_if:target,single|nullable|exists:clients,id',
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
            // Dispatch a queued job per client to avoid timeout with thousands of users
            Client::chunk(100, function ($clients) use ($request) {
                foreach ($clients as $client) {
                    SendAdminNotificationJob::dispatch(
                        $client->id,
                        $request->type,
                        $request->title,
                        $request->body,
                    );
                }
            });

            $count = Client::count();
            return response()->json([
                'status' => 'success',
                'message' => "Notification en cours d'envoi à {$count} clients (tâches en file d'attente).",
            ]);
        }

        // Single client — dispatch job as well for consistency
        $client = Client::findOrFail($request->client_id);
        SendAdminNotificationJob::dispatch(
            $client->id,
            $request->type,
            $request->title,
            $request->body,
        );

        return response()->json([
            'status' => 'success',
            'message' => "Notification en cours d'envoi à {$client->email}.",
        ]);
    }
}
