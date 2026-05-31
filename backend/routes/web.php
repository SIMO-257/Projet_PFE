<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmailVerificationController;

// Route::get('/{any}', function () {
//     $path = public_path('index.html');
//     if (!file_exists($path)) {
//         return response()->json(['message' => 'Frontend not built'], 404);
//     }
//     return file_get_contents($path);
// })->where('any', '.*');

// Route::get('/login', function () {
//     return response()->json([
//         'status' => 'error',
//         'message' => 'Unauthenticated.',
//     ], 401);
// })->name('login');

// // Email verification click link — web route, no auth required
// Route::get('/email/verify/{token}', [EmailVerificationController::class, 'verify'])
//     ->name('verification.verify');
