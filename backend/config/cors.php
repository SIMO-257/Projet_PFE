<?php

$allowedOrigins = env('CORS_ALLOWED_ORIGINS', '*');

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'broadcasting/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $allowedOrigins === '*'
        ? ['*']
        : array_map('trim', explode(',', $allowedOrigins)),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
