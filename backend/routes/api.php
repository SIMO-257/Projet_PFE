<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClientController;

Route::post('/signup', [ClientController::class, 'signup'])->name('api.client.signup');
Route::post('/login', [ClientController::class, 'login'])->name('api.client.login');
Route::post('/forgot-password', [ClientController::class, 'forgotPassword'])->name('api.client.forgot_password');
Route::post('/reset-password', [ClientController::class, 'resetPassword'])->name('api.client.reset_password');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ClientController::class, 'fetch_profile'])->name('api.client.profile');
    Route::put('/profile', [ClientController::class, 'update_profile'])->name('api.client.profile.update');
    Route::post('/logout', [ClientController::class, 'logout'])->name('api.client.logout');
    Route::post('/logout-all', [ClientController::class, 'logoutAll'])->name('api.client.logout_all');
    Route::get('/home', [ClientController::class, 'home'])->name('api.client.home');
});
