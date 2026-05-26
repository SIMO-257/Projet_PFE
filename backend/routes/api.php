<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\EmailVerificationController;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

// Public Routes
Route::post('/signup', [ClientController::class, 'signup'])->middleware('throttle:6,1')->name('api.client.signup');
Route::post('/login', [ClientController::class, 'login'])->middleware('throttle:login')->name('api.client.login');
Route::post('/forgot-password', [ClientController::class, 'forgotPassword'])->middleware('throttle:3,1')->name('api.client.forgot_password');
Route::post('/reset-password', [ClientController::class, 'resetPassword'])->middleware('throttle:3,1')->name('api.client.reset_password');

// Email verification resend — no auth required (user is not logged in yet)
Route::post('/email/resend', [EmailVerificationController::class, 'resend'])
    ->middleware('throttle:3,60');  // max 3 requests per 60 minutes per IP
Route::post('/email/verify-code', [EmailVerificationController::class, 'verifyCode'])
    ->middleware('throttle:6,1');   // max 6 attempts per minute per IP

// Stripe Webhook (Public, CSRF excluded in bootstrap/app.php)
Route::post('/webhooks/stripe', [\App\Http\Controllers\StripeWebhookController::class, 'handle'])->middleware('throttle:60,1')->name('api.stripe.webhook');

// Protected Routes
Route::middleware(['auth:sanctum', 'track.activity'])->group(function () {
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
    Route::post('/tickets/nfc/challenge', [TicketController::class, 'createNfcChallenge'])->middleware('throttle:validation')->name('api.tickets.nfc.challenge');
    Route::post('/tickets/nfc/consume', [TicketController::class, 'consumeNfcChallenge'])->middleware('throttle:validation')->name('api.tickets.nfc.consume');
    Route::post('/tickets/qr/token', [TicketController::class, 'createQrValidationToken'])->middleware('throttle:validation')->name('api.tickets.qr.token');
    Route::post('/tickets/qr/consume', [TicketController::class, 'consumeQrValidationToken'])->middleware('throttle:validation')->name('api.tickets.qr.consume');
    Route::get('/tickets/{uuid}', [TicketController::class, 'show'])->name('api.tickets.show');
    Route::post('/tickets/{uuid}/validate', [TicketController::class, 'validateTicket'])->middleware('throttle:validation')->name('api.tickets.validate');

    // Wallet Routes
    Route::get('/wallet', [\App\Http\Controllers\WalletController::class, 'index'])->name('api.wallet.index');
    Route::get('/wallet/transactions', [\App\Http\Controllers\WalletController::class, 'transactions'])->name('api.wallet.transactions');
    Route::post('/wallet/recharge/init', [\App\Http\Controllers\WalletController::class, 'rechargeInit'])->middleware('throttle:recharge')->name('api.wallet.recharge.init');
    Route::post('/wallet/recharge/confirm', [\App\Http\Controllers\WalletController::class, 'rechargeConfirm'])->middleware('throttle:10,1')->name('api.wallet.recharge.confirm');

    // Checkout & Payment Routes
    Route::post('/payments/create-intent', [\App\Http\Controllers\PaymentController::class, 'createIntent'])->middleware('throttle:10,1')->name('api.payments.create_intent');
    Route::post('/payments/cancel-intent', [\App\Http\Controllers\PaymentController::class, 'cancelIntent'])->middleware('throttle:10,1')->name('api.payments.cancel_intent');

    // Notification Routes
    Route::prefix('notifications')->group(function () {
        Route::get('/', [\App\Http\Controllers\NotificationController::class, 'index'])->name('api.notifications.index');
        Route::get('/unread-count', [\App\Http\Controllers\NotificationController::class, 'unreadCount'])->name('api.notifications.unread_count');
        Route::post('/log-failure', [\App\Http\Controllers\NotificationController::class, 'logFailure'])->name('api.notifications.log_failure');
        Route::patch('/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllRead'])->name('api.notifications.read_all');
        Route::patch('/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markRead'])->name('api.notifications.read');
        Route::delete('/{id}', [\App\Http\Controllers\NotificationController::class, 'destroy'])->name('api.notifications.destroy');
    });

    Route::put('/user/fcm-token', [ClientController::class, 'updateFcmToken'])->name('api.client.fcm_token.update');
    Route::get('/user/notification-preferences', [ClientController::class, 'getNotificationPreferences'])->name('api.client.notification_preferences.get');
    Route::patch('/user/notification-preferences', [ClientController::class, 'updateNotificationPreferences'])->name('api.client.notification_preferences.update');
    Route::get('/user/preferences', [ClientController::class, 'getPreferences'])->name('api.client.preferences.get');
    Route::patch('/user/preferences', [ClientController::class, 'updatePreferences'])->name('api.client.preferences.update');

    // Help & Support Routes
    Route::get('/help', [\App\Http\Controllers\RapportController::class, 'index'])->name('api.help.index');
    Route::post('/rapports', [\App\Http\Controllers\RapportController::class, 'store'])->name('api.rapports.store');
});

// ─── ADMIN ROUTES ────────────────────────────────────────────
use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminClientController;
use App\Http\Controllers\Admin\AdminTicketController;
use App\Http\Controllers\Admin\AdminTransactionController;
use App\Http\Controllers\Admin\AdminNotificationController;
use App\Http\Controllers\Admin\AdminProfileController;

// Public admin route — no auth required
Route::prefix('admin')->group(function () {
    Route::post('/login',  [AdminAuthController::class, 'login']);
});

// Protected admin routes — requires sanctum token and admin check
Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/logout',  [AdminAuthController::class, 'logout']);
    Route::get('/me',       [AdminAuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard', [AdminDashboardController::class, 'index']);

    // Clients
    Route::get('/clients',                       [AdminClientController::class, 'index']);
    Route::get('/clients/{client}',              [AdminClientController::class, 'show']);
    Route::patch('/clients/{client}/toggle-status',  [AdminClientController::class, 'toggleStatus']);

    // Tickets
    Route::get('/tickets', [AdminTicketController::class, 'index']);

    // Transactions
    Route::get('/transactions', [AdminTransactionController::class, 'index']);

    // Notifications
    Route::post('/notifications/send', [AdminNotificationController::class, 'send']);

    // Profile
    Route::put('/profile', [AdminProfileController::class, 'update']);

    // Help & Support — Admin Rapports
    Route::get('/rapports', [\App\Http\Controllers\Admin\AdminRapportController::class, 'index']);
    Route::patch('/rapports/{id}/statut', [\App\Http\Controllers\Admin\AdminRapportController::class, 'updateStatut']);
});
