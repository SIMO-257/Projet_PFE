<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClientController;

Route::get('/', function () {
    return view('welcome');
});


Route::get('/login', [ClientController::class, 'showLogin'])->name('login');
Route::post('/login', [ClientController::class, 'login']);
Route::post('/logout', [ClientController::class, 'logout'])->name('logout');
