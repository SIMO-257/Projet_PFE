<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\EmailVerificationController;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

// Public Routes
Route::post('/users/signup', [UserController::class, 'signup'])->middleware('throttle:6,1')->name('api.users.signup');
Route::post('/users/login', [UserController::class, 'login'])->middleware('throttle:login')->name('api.users.login');
Route::post('/users/forgot-password', [UserController::class, 'forgotPassword'])->middleware('throttle:3,1')->name('api.users.forgot_password');
Route::post('/users/reset-password', [UserController::class, 'resetPassword'])->middleware('throttle:3,1')->name('api.users.reset_password');

// Email verification resend — no auth required (user is not logged in yet)
Route::post('/email/resend', [EmailVerificationController::class, 'resend'])
    ->middleware('throttle:3,60');  // max 3 requests per 60 minutes per IP
Route::post('/email/verify-code', [EmailVerificationController::class, 'verifyCode'])
    ->middleware('throttle:6,1');   // max 6 attempts per minute per IP

// Stripe Webhook (Public, CSRF excluded in bootstrap/app.php)
Route::post('/webhooks/stripe', [\App\Http\Controllers\StripeWebhookController::class, 'handle'])->middleware('throttle:60,1')->name('api.stripe.webhook');

// Protected Routes
Route::middleware(['auth:sanctum', 'track.activity'])->group(function () {
    Route::get('/users/profile', [UserController::class, 'fetch_profile'])->name('api.users.profile');
    Route::post('/users/profile/avatar', [UserController::class, 'upload_avatar'])->name('api.users.profile.avatar');
    Route::put('/users/profile', [UserController::class, 'update_profile'])->name('api.users.profile.update');
    Route::post('/users/logout', [UserController::class, 'logout'])->name('api.users.logout');
    Route::post('/users/logout-all', [UserController::class, 'logoutAll'])->name('api.users.logout_all');
    Route::get('/users/home', [UserController::class, 'home'])->name('api.users.home');

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


    // User Preferences & FCM
    Route::put('/users/fcm-token', [UserController::class, 'updateFcmToken'])->name('api.users.fcm_token.update');
    Route::get('/users/notification-preferences', [UserController::class, 'getNotificationPreferences'])->name('api.users.notification_preferences.get');
    Route::patch('/users/notification-preferences', [UserController::class, 'updateNotificationPreferences'])->name('api.users.notification_preferences.update');
    Route::get('/users/preferences', [UserController::class, 'getPreferences'])->name('api.users.preferences.get');
    Route::patch('/users/preferences', [UserController::class, 'updatePreferences'])->name('api.users.preferences.update');

    // Help & Support Routes
    Route::get('/help', [\App\Http\Controllers\RapportController::class, 'index'])->name('api.help.index');
    Route::post('/rapports', [\App\Http\Controllers\RapportController::class, 'store'])->name('api.rapports.store');

    // Student Verification
    Route::get('/users/student-status', [UserController::class, 'studentStatus'])->name('api.users.student.status');
    Route::post('/users/student-verification', [UserController::class, 'submitStudentVerification'])->middleware('throttle:3,60')->name('api.users.student.verification');

    
});

// ─── ADMIN ROUTES ────────────────────────────────────────────
use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminTicketController;
use App\Http\Controllers\Admin\AdminTransactionController;
use App\Http\Controllers\Admin\AdminNotificationController;
use App\Http\Controllers\Admin\AdminProfileController;

// Public admin route — no auth required (throttled like user login)
Route::prefix('admin')->group(function () {
    Route::post('/login',  [AdminAuthController::class, 'login'])->middleware('throttle:login');
});

// Protected admin routes — requires sanctum token and admin check
Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/logout',  [AdminAuthController::class, 'logout']);
    Route::get('/me',       [AdminAuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard', [AdminDashboardController::class, 'index']);

    // Users (formerly Clients)
    Route::get('/users',                       [AdminUserController::class, 'index']);
    Route::get('/users/{user}',              [AdminUserController::class, 'show']);
    Route::patch('/users/{user}/toggle-status',  [AdminUserController::class, 'toggleStatus']);

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
