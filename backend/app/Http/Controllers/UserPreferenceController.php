<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserPreferenceController extends Controller
{
    public function updateFcmToken(Request $request)
    {
        $request->validate(['fcm_token' => 'required|string']);
        $request->user()->update(['fcm_token' => $request->fcm_token]);
        return $this->successResponse(null, 'FCM token updated');
    }

    public function getNotificationPreferences(Request $request)
    {
        return $this->successResponse([
            'notification_prefs' => $request->user()->notification_prefs ?? [
                'validation' => true,
                'payment' => true,
                'security' => true,
                'promo' => false,
            ]
        ], 'Notification preferences fetched successfully');
    }

    public function updateNotificationPreferences(Request $request)
    {
        $validated = $request->validate([
            'preferences' => 'required|array',
            'preferences.validation' => 'boolean',
            'preferences.payment' => 'boolean',
            'preferences.security' => 'boolean',
            'preferences.promo' => 'boolean',
        ]);

        $request->user()->update(['notification_prefs' => $validated['preferences']]);

        return $this->successResponse(null, 'Notification preferences updated');
    }

    public function getPreferences(Request $request)
    {
        $defaults = [
            'analytics_enabled'          => true,
            'auth_purchase'              => false,
            'pin_enabled'                => true,
            'biometric_enabled'          => false,
            'anti_replay_alerts'         => true,
            'suspicious_activity_alerts' => true,
            'card_frozen'                => false,
        ];

        $prefs = array_merge($defaults, $request->user()->user_preferences ?? []);

        return $this->successResponse($prefs, 'User preferences fetched successfully');
    }

    public function updatePreferences(Request $request)
    {
        $validated = $request->validate([
            'analytics_enabled'          => 'sometimes|boolean',
            'auth_purchase'              => 'sometimes|boolean',
            'pin_enabled'                => 'sometimes|boolean',
            'biometric_enabled'          => 'sometimes|boolean',
            'anti_replay_alerts'         => 'sometimes|boolean',
            'suspicious_activity_alerts' => 'sometimes|boolean',
            'card_frozen'                => 'sometimes|boolean',
        ]);

        $current = $request->user()->user_preferences ?? [];
        $updated = array_merge($current, $validated);

        $request->user()->update(['user_preferences' => $updated]);

        return $this->successResponse($updated, 'Préférences mises à jour');
    }
}
