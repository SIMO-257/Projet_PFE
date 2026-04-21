<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\TicketController;

Route::post('/signup', [ClientController::class, 'signup'])->name('api.client.signup');
Route::post('/login', [ClientController::class, 'login'])->name('api.client.login');
Route::post('/forgot-password', [ClientController::class, 'forgotPassword'])->name('api.client.forgot_password');
<<<<<<< HEAD
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
=======
Route::post('/reset-password', [ClientController::class, 'resetPassword'])->name('api.client.reset_password');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ClientController::class, 'fetch_profile'])->name('api.client.profile');
    Route::put('/profile', [ClientController::class, 'update_profile'])->name('api.client.profile.update');
    Route::post('/logout', [ClientController::class, 'logout'])->name('api.client.logout');
    Route::post('/logout-all', [ClientController::class, 'logoutAll'])->name('api.client.logout_all');
    Route::get('/home', [ClientController::class, 'home'])->name('api.client.home');
});
>>>>>>> origin/simo-branch
