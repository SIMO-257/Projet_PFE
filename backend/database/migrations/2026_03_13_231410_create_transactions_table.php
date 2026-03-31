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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
<<<<<<< Updated upstream
            $table->foreignId('user_id')->constrained('clients')->onDelete('cascade');
            $table->enum('type', ['purchase','validation']);
=======
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('type', ['purchase', 'topup', 'refund', 'validation']);
>>>>>>> Stashed changes
            $table->decimal('amount', 10, 2);
            $table->decimal('balance_before', 10, 2);
            $table->decimal('balance_after', 10, 2);
            $table->string('payment_method', 50)->default('wallet');
            $table->string('reference', 100)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
