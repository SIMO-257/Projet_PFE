<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmailVerificationController;

Route::get('/', function () {
    return response()->json([
        'message' => 'CasaWay backend API is running.',
    ]);
});

// Email verification click link — web route, no auth required
Route::get('/email/verify/{token}', [EmailVerificationController::class, 'verify'])
    ->name('verification.verify');
