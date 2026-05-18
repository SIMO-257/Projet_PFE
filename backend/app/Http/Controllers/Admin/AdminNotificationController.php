<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class AdminNotificationController extends Controller
{
    public function __construct(private NotificationService $notificationService) {}

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
            \Illuminate\Support\Facades\Log::warning('Notification Validation Failed', [
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
            // Send to all clients in chunks to avoid memory issues
            Client::chunk(100, function ($clients) use ($request) {
                foreach ($clients as $client) {
                    $this->notificationService->send(
                        $client,
                        $request->type,
                        'info',
                        $request->title,
                        $request->body,
                    );
                }
            });
            $count = Client::count();
            return response()->json([
                'status' => 'success',
                'message' => "Notification envoyée à {$count} clients.",
            ]);
        }

        $client = Client::findOrFail($request->client_id);
        $this->notificationService->send(
            $client,
            $request->type,
            'info',
            $request->title,
            $request->body,
        );

        return response()->json([
            'status' => 'success',
            'message' => "Notification envoyée à {$client->email}.",
        ]);
    }
}
