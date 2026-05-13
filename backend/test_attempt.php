<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$credentials = [
    'email' => '7mohammed.mammah@gmail.com',
    'password' => 'password123'
];

$guard = Illuminate\Support\Facades\Auth::guard('client');

echo "Attempting login...\n";
$success = $guard->attempt($credentials);

if ($success) {
    echo "Login SUCCESS!\n";
    echo "User ID: " . $guard->user()->id . "\n";
} else {
    echo "Login FAILED!\n";
    $provider = $guard->getProvider();
    $user = $provider->retrieveByCredentials($credentials);
    if (!$user) {
        echo "Reason: User not found by retrieveByCredentials.\n";
    } else {
        echo "User found by retrieveByCredentials.\n";
        $valid = $provider->validateCredentials($user, $credentials);
        if (!$valid) {
            echo "Reason: validateCredentials returned false. Password hash does not match.\n";
            echo "Hash in DB: " . $user->getAuthPassword() . "\n";
            echo "Hash check: " . (Illuminate\Support\Facades\Hash::check('password123', $user->getAuthPassword()) ? 'True' : 'False') . "\n";
        } else {
            echo "validateCredentials returned TRUE. Something else is failing in attempt().\n";
        }
    }
}
