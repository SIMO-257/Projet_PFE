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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained('clients')->onDelete('cascade');
            $table->foreignId('ticket_type_id')->constrained('ticket_types')->onDelete('cascade');
            $table->foreignId('purchase_id')->nullable()->constrained('transactions')->onDelete('set null');
            $table->enum('status', ['active', 'used', 'expired'])->default('active');
            $table->timestamp('valid_from')->nullable();
            $table->timestamp('valid_until')->nullable();
            $table->integer('remaining_uses')->nullable();
            $table->decimal('price_paid', 10, 2);
            $table->timestamps();

            // Indexes
            $table->index('user_id');
            $table->index('uuid');
            $table->index('ticket_type_id');
            $table->index('status');
            $table->index('valid_until');
            $table->index(['user_id', 'status']);
        });

        // Add foreign key for default_ticket_id in clients table
        Schema::table('clients', function (Blueprint $table) {
            $table->foreignId('default_ticket_id')
                ->nullable()
                ->after('client_preferences')
                ->constrained('tickets')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropConstrainedForeignId('default_ticket_id');
        });
        Schema::dropIfExists('tickets');
    }
};
