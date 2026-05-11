<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'CasaWay backend API is running.',
    ]);
});

Route::get('/login', function () {
    return response()->json([
        'status' => 'error',
        'message' => 'Unauthenticated.',
    ], 401);
})->name('login');
