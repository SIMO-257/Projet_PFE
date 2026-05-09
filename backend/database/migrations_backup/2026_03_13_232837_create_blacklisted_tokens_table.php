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
        Schema::create('blacklisted_tokens', function (Blueprint $table) {
            $table->id();
            $table->uuid('ticket_uuid');
            $table->text('jws_signature')->nullable();
            $table->string('reason', 100); // e.g., 'refunded', 'expired', 'stolen'
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
            
            $table->index('ticket_uuid');
            $table->index('expires_at');
            $table->foreign('ticket_uuid')
                ->references('uuid')
                ->on('tickets');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blacklisted_tokens');
    }
};
