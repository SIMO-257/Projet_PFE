<?php
require 'backend/vendor/autoload.php';
$app = require_once 'backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Client;
use Illuminate\Support\Facades\Hash;

$c = Client::where('email', 'test@example.com')->first();
if (!$c) {
    echo "User not found\n";
    exit;
}

$hash = $c->getAttributes()['password_hash'];
echo "Email: " . $c->email . "\n";
echo "Hash: " . $hash . "\n";
$match = Hash::check('password', $hash);
echo "Match 'password': " . ($match ? "YES" : "NO") . "\n";
