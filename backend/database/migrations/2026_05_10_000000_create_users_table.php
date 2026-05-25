<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Track whether we actually created the table (safe rollback guard). */
    private bool $created = false;

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Guard: on existing databases the table already exists
        // (renamed from `clients` by the rename migration)
        if (Schema::hasTable('users')) {
            return;
        }

        $this->created = true;

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('full_name', 100)->nullable();
            $table->string('phone', 20)->unique()->nullable();
            $table->string('email', 255)->unique();
            $table->string('email_verification_code', 6)->nullable();
            $table->string('email_verification_token')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('email_verification_sent_at')->nullable();
            $table->string('password_hash', 255);
            $table->string('avatar_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_active_at')->nullable();
            $table->string('fcm_token')->nullable();
            $table->json('notification_prefs')->nullable();
            $table->json('user_preferences')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('email');
            $table->index('uuid');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!$this->created) {
            return;
        }

        Schema::dropIfExists('users');
    }

};
