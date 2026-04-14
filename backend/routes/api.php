<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\TicketController;

Route::post('/signup', [ClientController::class, 'signup'])->middleware('credentialsMiddlware')->name('api.client.signup');
Route::post('/login', [ClientController::class, 'login'])->name('api.client.login');
Route::post('/forgot-password', [ClientController::class, 'forgotPassword'])->name('api.client.forgot_password');
Route::get('/profile', [ClientController::class, 'fetch_profile'])->name('api.client.profile');
Route::post('/profile/avatar', [ClientController::class, 'upload_avatar'])->name('api.client.profile.avatar');
Route::put('/profile', [ClientController::class, 'update_profile'])->middleware('profilMiddleware')->name('api.client.profile.update');
Route::post('/logout', [ClientController::class, 'logout'])->name('api.client.logout');
Route::get('/home', [ClientController::class, 'home'])->name('api.client.home');

// Ticket Routes
Route::get('/ticket-types', [TicketController::class, 'getTicketTypes'])->name('api.tickets.types');
Route::post('/tickets/purchase', [TicketController::class, 'purchase'])->name('api.tickets.purchase');
Route::get('/tickets', [TicketController::class, 'index'])->name('api.tickets.index');
Route::get('/tickets/{uuid}', [TicketController::class, 'show'])->name('api.tickets.show');
