<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rules\Password;

class ClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('phone')) {
            $this->merge([
                'phone' => preg_replace('/\D/', '', $this->phone),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email:rfc,dns|max:255|unique:clients,email',
            'phone' => ['required', 'string', 'regex:/^(06|07)\d{8}$/', 'unique:clients,phone'],
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
            'full_name' => 'required|string|max:255',
            'profile_file' => 'nullable|file|max:5120|mimes:jpg,jpeg,png,webp',
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email is required.',
            'email.email' => 'Email format is invalid.',
            'email.unique' => 'This email is already used.',
            'phone.required' => 'Phone number is required.',
            'phone.regex' => 'Phone must start with 06 or 07 and have 10 digits.',
            'phone.unique' => 'This phone number is already used.',
            'password.required' => 'Password is required.',
            'password.min' => 'Password must be at least 8 characters.',
            'password.confirmed' => 'Password confirmation does not match.',
            'full_name.required' => 'Full name is required.',
            'full_name.max' => 'Full name is too long.',
            'profile_file.file' => 'Profile file is not valid.',
            'profile_file.max' => 'Profile file is too large (max 5MB).',
            'profile_file.mimes' => 'Profile file must be jpg, jpeg, png, or webp.',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'message' => 'Validation failed.',
            'errors' => $validator->errors(),
        ], 422));
    }
}
