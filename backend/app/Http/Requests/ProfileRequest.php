<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class ProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $client = $this->user();

        return [
            'phone' => [
                'nullable',
                'string',
                'regex:/^(06|07)\d{8}$/',
                Rule::unique('clients', 'phone')->ignore($client?->id),
            ],
            'full_name' => 'required|string|max:255',
            'profile_file' => 'nullable|file|max:5120|mimes:jpg,jpeg,png,webp',
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Phone must start with 06 or 07 and have 10 digits.',
            'phone.unique' => 'This phone number is already used.',
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
