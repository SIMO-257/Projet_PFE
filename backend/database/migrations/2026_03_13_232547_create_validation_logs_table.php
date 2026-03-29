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
        Schema::create('validation_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->nullable()->constrained('tickets')->onDelete('set null');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('validator_id', 100); // ID of the device/bus/tram validator
            $table->enum('validation_type', ['nfc', 'qr']);
            $table->enum('status', ['success', 'failure', 'offline_accepted']);
            $table->string('failure_reason', 255)->nullable();
            $table->jsonb('location')->nullable(); // Storing lat/lng as JSON for PostgreSQL flexibility
            $table->jsonb('metadata')->nullable(); // Raw data for debugging
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('validation_logs');
    }
};
