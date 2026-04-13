<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CredentialsMiddlware
{
    public function handle(Request $request, Closure $next)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255|unique:clients,email',
            'phone' => ['required', 'string', 'regex:/^(06|07)\\d{8}$/', 'unique:clients,phone'],
            'password' => 'required|string|min:8|confirmed',
            'full_name' => 'nullable|string|max:255',
            'first_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
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

        $data = $validator->validated();

        if (!empty($data['full_name'])) {
            $parts = preg_split('/[\\s,]+/', trim((string) $data['full_name']), -1, PREG_SPLIT_NO_EMPTY);
            $familyName = array_shift($parts) ?: null;
            $personalName = count($parts) ? implode(' ', $parts) : null;
            $data['last_name'] = $familyName;
            $data['first_name'] = $personalName;
        }

        $request->attributes->set('validated_signup', $data);

        return $next($request);
    }
}

