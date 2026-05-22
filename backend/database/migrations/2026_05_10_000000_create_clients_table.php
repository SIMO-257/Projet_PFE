<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
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
            $table->json('client_preferences')->nullable();
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
        Schema::dropIfExists('clients');
    }

};
