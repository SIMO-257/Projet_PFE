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
            $table->foreignId('user_id')->constrained('clients')->onDelete('cascade');
            $table->string('validator_id', 100);
            $table->enum('validation_type', ['nfc', 'qr']);
            $table->enum('status', ['success', 'failure', 'offline_accepted']);
            $table->string('failure_reason', 255)->nullable();
            $table->json('location')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();

            // Indexes
            $table->index('ticket_id');
            $table->index('user_id');
            $table->index('validator_id');
            $table->index('validation_type');
            $table->index('status');
            $table->index('created_at');
            $table->index(['user_id', 'status']);
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
