<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClientController;

Route::post('/signup', [ClientController::class, 'signup'])->name('api.client.signup');
Route::post('/login', [ClientController::class, 'login'])->middleware('authMiddleware')->name('api.client.login');
Route::post('/forgot-password', [ClientController::class, 'forgotPassword'])->name('api.client.forgot_password');
Route::get('/profile', [ClientController::class, 'fetch_profile'])->name('api.client.profile');
Route::put('/profile', [ClientController::class, 'update_profile'])->name('api.client.profile.update');
Route::post('/logout', [ClientController::class, 'logout'])->name('api.client.logout');
Route::get('/home', [ClientController::class, 'home'])->name('api.client.home');
