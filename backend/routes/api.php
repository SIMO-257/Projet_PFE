<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserPreferenceController;
use App\Http\Controllers\UserPinController;
use App\Http\Controllers\StudentVerificationController;
use App\Http\Controllers\TicketTypeController;
use App\Http\Controllers\TicketPurchaseController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\TicketValidationController;
use App\Http\Controllers\EmailVerificationController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RapportController;
use App\Http\Controllers\Admin\AdminRapportController;
use App\Http\Controllers\Admin\AdminStudentVerificationController;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

// Public Routes
Route::post('/users/signup', [AuthController::class, 'signup'])->middleware('throttle:6,1')->name('api.users.signup');
Route::post('/users/login', [AuthController::class, 'login'])->middleware('throttle:login')->name('api.users.login');
Route::post('/users/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,1')->name('api.users.forgot_password');
Route::post('/users/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:3,1')->name('api.users.reset_password');

// Email verification resend — no auth required (user is not logged in yet)
Route::post('/email/resend', [EmailVerificationController::class, 'resend'])
    ->middleware('throttle:3,60');  // max 3 requests per 60 minutes per IP
Route::post('/email/verify-code', [EmailVerificationController::class, 'verifyCode'])
    ->middleware('throttle:6,1');   // max 6 attempts per minute per IP

// Stripe Webhook (Public, CSRF excluded in bootstrap/app.php)
Route::post('/webhooks/stripe', [StripeWebhookController::class, 'handle'])->middleware('throttle:60,1')->name('api.stripe.webhook');

// Protected Routes
Route::middleware(['auth:sanctum', 'track.activity'])->group(function () {
    Route::get('/users/profile', [ProfileController::class, 'fetch_profile'])->name('api.users.profile');
    Route::put('/users/profile', [ProfileController::class, 'update_profile'])->name('api.users.profile.update');
    Route::post('/users/logout', [AuthController::class, 'logout'])->name('api.users.logout');
    Route::get('/users/home', [ProfileController::class, 'home'])->name('api.users.home');

    // Ticket Types
    Route::get('/ticket-types', [TicketTypeController::class, 'index'])->name('api.tickets.types');

    // Ticket Purchase
    Route::post('/tickets/purchase', [TicketPurchaseController::class, 'purchase'])->middleware('throttle:10,1')->name('api.tickets.purchase');

    // Ticket Display & Cards
    Route::get('/tickets', [TicketController::class, 'index'])->name('api.tickets.index');
    Route::get('/tickets/cards', [TicketController::class, 'cards'])->name('api.tickets.cards');
    Route::post('/tickets/cards/default', [TicketController::class, 'setDefaultCard'])->name('api.tickets.cards.default');
    Route::get('/tickets/{uuid}', [TicketController::class, 'show'])->name('api.tickets.show');

    // NFC Validation
    Route::post('/tickets/nfc/challenge', [TicketValidationController::class, 'createNfcChallenge'])->middleware('throttle:validation')->name('api.tickets.nfc.challenge');
    Route::post('/tickets/nfc/consume', [TicketValidationController::class, 'consumeNfcChallenge'])->middleware('throttle:validation')->name('api.tickets.nfc.consume');

    // QR Validation
    Route::post('/tickets/qr/token', [TicketValidationController::class, 'createQrValidationToken'])->middleware('throttle:validation')->name('api.tickets.qr.token');
    Route::post('/tickets/qr/consume', [TicketValidationController::class, 'consumeQrValidationToken'])->middleware('throttle:validation')->name('api.tickets.qr.consume');

    // Direct Validation
    Route::post('/tickets/{uuid}/validate', [TicketValidationController::class, 'validateTicket'])->middleware('throttle:validation')->name('api.tickets.validate');

    // Wallet Routes
    Route::get('/wallet', [WalletController::class, 'index'])->name('api.wallet.index');
    Route::get('/wallet/transactions', [WalletController::class, 'transactions'])->name('api.wallet.transactions');
    Route::post('/wallet/recharge/init', [PaymentController::class, 'createIntent'])->middleware('throttle:recharge')->name('api.wallet.recharge.init');
    Route::post('/wallet/recharge/confirm', [WalletController::class, 'rechargeConfirm'])->middleware('throttle:10,1')->name('api.wallet.recharge.confirm');
    Route::post('/wallet/recharge/cancel', [PaymentController::class, 'cancelIntent'])->middleware('throttle:10,1')->name('api.wallet.recharge.cancel');

    // Checkout & Payment Routes
    Route::post('/payments/create-intent', [PaymentController::class, 'createIntent'])->middleware('throttle:10,1')->name('api.payments.create_intent');
    Route::post('/payments/cancel-intent', [PaymentController::class, 'cancelIntent'])->middleware('throttle:10,1')->name('api.payments.cancel_intent');

    // Notification Routes
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('api.notifications.index');
        Route::get('/unread-count', [NotificationController::class, 'unreadCount'])->name('api.notifications.unread_count');
        Route::post('/log-failure', [NotificationController::class, 'logFailure'])->name('api.notifications.log_failure');
        Route::patch('/read-all', [NotificationController::class, 'markAllRead'])->name('api.notifications.read_all');
        Route::patch('/{id}/read', [NotificationController::class, 'markRead'])->name('api.notifications.read');
        Route::delete('/{id}', [NotificationController::class, 'destroy'])->name('api.notifications.destroy');
    });


    // User Preferences & FCM
    Route::put('/users/fcm-token', [UserPreferenceController::class, 'updateFcmToken'])->name('api.users.fcm_token.update');
    Route::get('/users/notification-preferences', [UserPreferenceController::class, 'getNotificationPreferences'])->name('api.users.notification_preferences.get');
    Route::patch('/users/notification-preferences', [UserPreferenceController::class, 'updateNotificationPreferences'])->name('api.users.notification_preferences.update');
    Route::get('/users/preferences', [UserPreferenceController::class, 'getPreferences'])->name('api.users.preferences.get');
    Route::patch('/users/preferences', [UserPreferenceController::class, 'updatePreferences'])->name('api.users.preferences.update');

    // Help & Support Routes
    Route::get('/help', [RapportController::class, 'index'])->name('api.help.index');
    Route::post('/repports', [RapportController::class, 'store'])->name('api.repports.store');

    // PIN Code
    Route::post('/users/pin/set', [UserPinController::class, 'set'])->name('api.users.pin.set');
    Route::post('/users/pin/verify', [UserPinController::class, 'verify'])->name('api.users.pin.verify');
    Route::post('/users/pin/disable', [UserPinController::class, 'disable'])->name('api.users.pin.disable');
    Route::post('/users/pin/reset', [UserPinController::class, 'reset'])->name('api.users.pin.reset');
    Route::get('/users/pin/status', [UserPinController::class, 'status'])->name('api.users.pin.status');

    // Student Verification
    Route::get('/users/student-status', [StudentVerificationController::class, 'studentStatus'])->name('api.users.student.status');
    Route::post('/users/student-verification', [StudentVerificationController::class, 'submitStudentVerification'])->middleware('throttle:3,60')->name('api.users.student.verification');

    
});

// ─── ADMIN ROUTES ────────────────────────────────────────────
use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminTicketController;
use App\Http\Controllers\Admin\AdminTransactionController;
use App\Http\Controllers\Admin\AdminNotificationController;
use App\Http\Controllers\Admin\AdminProfileController;
use App\Http\Controllers\Admin\AdminValidationController;
use App\Http\Controllers\Admin\AdminManagementController;

// Public admin route — no auth required (throttled like user login)
Route::prefix('admin')->group(function () {
    Route::post('/login',[AdminAuthController::class, 'login'])->middleware('throttle:login');
});

// Protected admin routes — requires sanctum token and admin check
Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/logout',[AdminAuthController::class, 'logout']);
    Route::get('/me',[AdminAuthController::class, 'me']);

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

    // Help & Support — Admin Repports
    Route::get('/repports', [AdminRapportController::class, 'index']);
    Route::patch('/repports/{id}/statut', [AdminRapportController::class, 'updateStatut']);

    // Admin Management (super admin only)
    Route::get('/admins', [AdminManagementController::class, 'index']);
    Route::get('/admins/{admin}', [AdminManagementController::class, 'show']);
    Route::post('/admins', [AdminManagementController::class, 'store']);
    Route::put('/admins/{admin}', [AdminManagementController::class, 'update']);
    Route::patch('/admins/{admin}/toggle-status', [AdminManagementController::class, 'toggleStatus']);
    Route::delete('/admins/{admin}', [AdminManagementController::class, 'destroy']);

    // Student Verifications
    Route::get('/student-verifications', [AdminStudentVerificationController::class, 'index']);
    Route::get('/student-verifications/{id}', [AdminStudentVerificationController::class, 'show']);
    Route::post('/student-verifications/{id}/approve', [AdminStudentVerificationController::class, 'approve']);
    Route::post('/student-verifications/{id}/reject', [AdminStudentVerificationController::class, 'reject']);

    // Validator (admin can validate any user's tickets)
    Route::prefix('validator')->group(function () {
        Route::post('/validate-ticket/{uuid}', [AdminValidationController::class, 'validateTicket']);
        Route::post('/consume-qr', [AdminValidationController::class, 'consumeQr']);
        Route::post('/lookup', [AdminValidationController::class, 'lookupTicket']);
    });
});
