<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\Client::where('email', '7mohammed.mammah@gmail.com')->first();
if (!$user) {
    echo "User not found\n";
    exit;
}
echo "User found: " . $user->email . "\n";
echo "Password Hash: " . $user->password_hash . "\n";
echo "Active: " . $user->is_active . "\n";
