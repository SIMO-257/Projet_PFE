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
$user->password_hash = Illuminate\Support\Facades\Hash::make('password123');
$user->save();
echo "Password successfully reset to: password123\n";
