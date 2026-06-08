<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Safely adds any missing columns to the users table.
     * Each column is guarded by hasColumn() so this can be run
     * multiple times without errors, even if some columns already exist.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // ── Identity & contact ──
            if (!Schema::hasColumn('users', 'full_name')) {
                $table->string('full_name', 100)->nullable()->after('uuid');
            }
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone', 20)->unique()->nullable()->after('full_name');
            }
            if (!Schema::hasColumn('users', 'avatar_path')) {
                $table->string('avatar_path')->nullable()->after('password_hash');
            }

            // ── Student status ──
            if (!Schema::hasColumn('users', 'is_student')) {
                $table->boolean('is_student')->default(false)->after('phone');
            }
            if (!Schema::hasColumn('users', 'last_active_at')) {
                $table->timestamp('last_active_at')->nullable()->after('is_active');
            }

            // ── FCM / push tokens ──
            if (!Schema::hasColumn('users', 'fcm_token')) {
                $table->string('fcm_token')->nullable()->after('last_active_at');
            }

            // ── Email verification columns ──
            if (!Schema::hasColumn('users', 'email_verification_code')) {
                $table->string('email_verification_code', 6)->nullable()->after('email_verified_at');
            }
            if (!Schema::hasColumn('users', 'email_verification_token')) {
                $table->string('email_verification_token')->nullable()->after('email_verification_code');
            }
            if (!Schema::hasColumn('users', 'email_verification_sent_at')) {
                $table->timestamp('email_verification_sent_at')->nullable()->after('email_verification_token');
            }

            // ── Recovery email ──
            if (!Schema::hasColumn('users', 'recovery_email')) {
                $table->string('recovery_email')->nullable()->after('email');
            }
            if (!Schema::hasColumn('users', 'recovery_email_verified_at')) {
                $table->timestamp('recovery_email_verified_at')->nullable()->after('recovery_email');
            }

            // ── PIN hash (may have been added by earlier migration) ──
            if (!Schema::hasColumn('users', 'pin_hash')) {
                $table->string('pin_hash', 60)->nullable()->after('password_hash');
            }

            // ── JSON preferences ──
            if (!Schema::hasColumn('users', 'notification_prefs')) {
                $table->json('notification_prefs')->nullable()->after('fcm_token');
            }
            if (!Schema::hasColumn('users', 'user_preferences')) {
                $table->json('user_preferences')->nullable()->after('notification_prefs');
            }

            // ── Default ticket (added in separate migration) ──
            if (!Schema::hasColumn('users', 'default_ticket_id')) {
                try {
                    $table->foreignId('default_ticket_id')
                        ->nullable()
                        ->after('user_preferences')
                        ->constrained('tickets')
                        ->nullOnDelete();
                } catch (\Throwable $e) {
                    Log::warning('Could not add default_ticket_id foreign key', [
                        'error' => $e->getMessage(),
                    ]);
                    // Add as plain column without constraint as fallback
                    if (!Schema::hasColumn('users', 'default_ticket_id')) {
                        $table->unsignedBigInteger('default_ticket_id')->nullable()->after('user_preferences');
                    }
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * No-op: these are purely additive columns. Rolling back could
     * drop columns needed by other parts of the application.
     */
    public function down(): void
    {
        // Nothing to roll back — columns are additive and guarded.
    }
};
