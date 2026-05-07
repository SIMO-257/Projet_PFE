<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\TicketController;

// Public Routes
Route::post('/signup', [ClientController::class, 'signup'])->middleware('throttle:6,1')->name('api.client.signup');
Route::post('/login', [ClientController::class, 'login'])->middleware('throttle:login')->name('api.client.login');
Route::post('/forgot-password', [ClientController::class, 'forgotPassword'])->middleware('throttle:3,1')->name('api.client.forgot_password');
Route::post('/reset-password', [ClientController::class, 'resetPassword'])->middleware('throttle:3,1')->name('api.client.reset_password');

// Stripe Webhook (Public, CSRF excluded in bootstrap/app.php)
Route::post('/webhooks/stripe', [\App\Http\Controllers\StripeWebhookController::class, 'handle'])->middleware('throttle:60,1')->name('api.stripe.webhook');

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ClientController::class, 'fetch_profile'])->name('api.client.profile');
    Route::post('/profile/avatar', [ClientController::class, 'upload_avatar'])->name('api.client.profile.avatar');
    Route::put('/profile', [ClientController::class, 'update_profile'])->name('api.client.profile.update');
    Route::post('/logout', [ClientController::class, 'logout'])->name('api.client.logout');
    Route::post('/logout-all', [ClientController::class, 'logoutAll'])->name('api.client.logout_all');
    Route::get('/home', [ClientController::class, 'home'])->name('api.client.home');

    // Ticket Routes
    Route::get('/ticket-types', [TicketController::class, 'getTicketTypes'])->name('api.tickets.types');
    Route::post('/tickets/purchase', [TicketController::class, 'purchase'])->middleware('throttle:10,1')->name('api.tickets.purchase');
    Route::get('/tickets', [TicketController::class, 'index'])->name('api.tickets.index');
    Route::get('/tickets/cards', [TicketController::class, 'cards'])->name('api.tickets.cards');
    Route::post('/tickets/cards/default', [TicketController::class, 'setDefaultCard'])->name('api.tickets.cards.default');
    Route::get('/tickets/{uuid}', [TicketController::class, 'show'])->name('api.tickets.show');
    Route::post('/tickets/{uuid}/validate', [TicketController::class, 'validateTicket'])->middleware('throttle:validation')->name('api.tickets.validate');

    // Wallet Routes
    Route::get('/wallet', [\App\Http\Controllers\WalletController::class, 'index'])->name('api.wallet.index');
    Route::get('/wallet/transactions', [\App\Http\Controllers\WalletController::class, 'transactions'])->name('api.wallet.transactions');
    Route::post('/wallet/recharge/init', [\App\Http\Controllers\WalletController::class, 'rechargeInit'])->middleware('throttle:recharge')->name('api.wallet.recharge.init');
    Route::post('/wallet/recharge/confirm', [\App\Http\Controllers\WalletController::class, 'rechargeConfirm'])->middleware('throttle:10,1')->name('api.wallet.recharge.confirm');

    // Checkout & Payment Routes
    Route::post('/payments/create-intent', [\App\Http\Controllers\PaymentController::class, 'createIntent'])->middleware('throttle:10,1')->name('api.payments.create_intent');
    Route::post('/payments/billing-details', [\App\Http\Controllers\PaymentController::class, 'saveBillingDetails'])->name('api.payments.billing_details');
});
