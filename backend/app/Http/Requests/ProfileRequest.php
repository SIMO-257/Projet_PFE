<?php

namespace App\Http\Requests;

use App\Models\Client;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class ProfileRequest extends FormRequest
{
    private ?Client $client = null;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'uuid' => $this->input('uuid')
                ?? $this->header('X-Client-UUID')
                ?? $this->query('uuid')
                ?? $this->session()->get('client_uuid'),
        ]);
    }

    public function rules(): array
    {
        $uuid = (string) $this->input('uuid', '');
        $this->client = Client::where('uuid', $uuid)->first();

        return [
            'uuid' => 'required|uuid|exists:clients,uuid',
            'phone' => [
                'required',
                'string',
                'regex:/^(06|07)\d{8}$/',
                Rule::unique('clients', 'phone')->ignore($this->client?->id),
            ],
            'full_name' => 'nullable|string|max:255',
            'first_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'profile_file' => 'nullable|file|max:5120|mimes:jpg,jpeg,png,webp',
        ];
    }

    public function messages(): array
    {
        return [
            'uuid.required' => 'Client UUID is required.',
            'uuid.exists' => 'Client not found.',
            'phone.required' => 'Phone number is required.',
            'phone.regex' => 'Phone must start with 06 or 07 and have 10 digits.',
            'phone.unique' => 'This phone number is already used.',
            'full_name.max' => 'Full name is too long.',
            'profile_file.file' => 'Profile file is not valid.',
            'profile_file.max' => 'Profile file is too large (max 5MB).',
            'profile_file.mimes' => 'Profile file must be jpg, jpeg, png, or webp.',
        ];
    }

    protected function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $fullName = trim((string) $this->input('full_name', ''));
            if ($fullName !== '') {
                $parts = preg_split('/[\s,]+/', $fullName, -1, PREG_SPLIT_NO_EMPTY);
                if (count($parts) < 2) {
                    $validator->errors()->add('full_name', 'Full name must contain last name then first name.');
                }
            }
        });
    }

    protected function failedValidation(Validator $validator): void
    {
        $errors = $validator->errors();
        $status = $errors->has('uuid') ? 401 : 422;

        throw new HttpResponseException(response()->json([
            'message' => $status === 401 ? 'Unauthenticated.' : 'Validation failed.',
            'errors' => $errors,
        ], $status));
    }

    public function clientModel(): ?Client
    {
        return $this->client;
    }
}
