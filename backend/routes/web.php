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

use Illuminate\Support\Facades\File;

// Serve all files from storage/app/public
Route::get('/storage/{path}', function ($path) {
    $fullPath = storage_path('app/public/' . $path);
    
    // Security: Prevent directory traversal
    if (strpos($fullPath, '..') !== false) {
        abort(403);
    }
    
    // Check if file exists
    if (!File::exists($fullPath)) {
        abort(404);
    }
    
    // Return the file with proper headers
    $file = File::get($fullPath);
    $type = File::mimeType($fullPath);
    
    return response($file, 200)->header('Content-Type', $type);
})->where('path', '.*');
