<?php

namespace App\Http\Middleware;

use App\Models\Client;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProfilMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $uuid = $request->header('X-Client-UUID')
            ?? $request->query('uuid')
            ?? $request->session()->get('client_uuid');

        if (!$uuid) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $client = Client::where('uuid', $uuid)->first();
        if (!$client) {
            return response()->json(['message' => 'Client not found.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'phone' => ['required', 'string', 'regex:/^(06|07)\\d{8}$/', 'unique:clients,phone,'.$client->id],
            'full_name' => 'nullable|string|max:255',
        ]);

        $validator->after(function ($validator) use ($request) {
            $fullName = trim((string) $request->input('full_name', ''));
            if ($fullName !== '') {
                $parts = preg_split('/[\\s,]+/', $fullName, -1, PREG_SPLIT_NO_EMPTY);
                if (count($parts) < 2) {
                    $validator->errors()->add('full_name', 'Le nom complet doit contenir le nom de famille puis le prenom.');
                }
            }
        });

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $request->attributes->set('validated_profile', $validator->validated());
        $request->attributes->set('client', $client);

        return $next($request);
    }
}
