<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClientController;

Route::post('/signup', [ClientController::class, 'signup'])->middleware('credentialsMiddlware')->name('api.client.signup');
Route::post('/login', [ClientController::class, 'login'])->name('api.client.login');
Route::post('/forgot-password', [ClientController::class, 'forgotPassword'])->name('api.client.forgot_password');
Route::get('/profile', [ClientController::class, 'fetch_profile'])->name('api.client.profile');
Route::post('/profile/avatar', [ClientController::class, 'upload_avatar'])->name('api.client.profile.avatar');
Route::put('/profile', [ClientController::class, 'update_profile'])->middleware('profilMiddleware')->name('api.client.profile.update');
Route::get('/home', [ClientController::class, 'home'])->name('api.client.home');
