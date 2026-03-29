<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClientController;

Route::post('/signup', [ClientController::class, 'signup'])->name('api.client.signup');
Route::post('/login', [ClientController::class, 'login'])->name('api.client.login');
Route::get('/home', [ClientController::class, 'home'])->name('api.client.home');
