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
<<<<<<< Updated upstream
            $table->foreignId('user_id')->constrained('clients')->onDelete('cascade');
=======
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
>>>>>>> Stashed changes
            $table->foreignId('ticket_type_id')->constrained('ticket_types')->onDelete('cascade');
            $table->foreignId('purchase_id')->nullable()->constrained('transactions')->onDelete('set null');
            $table->enum('status', ['active', 'used', 'expired'])->default('active');
            $table->timestamp('valid_from')->nullable();
            $table->timestamp('valid_until')->nullable();
            $table->integer('remaining_uses')->nullable();
            $table->decimal('price_paid', 10, 2);
            $table->text('jws_signature')->nullable();
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
