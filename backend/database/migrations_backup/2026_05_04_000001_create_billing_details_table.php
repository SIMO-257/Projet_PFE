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
        // 1. Update transactions table with currency
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('currency', 3)->default('MAD')->after('amount');
        });

        // 2. Create billing_details table
        Schema::create('billing_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('clients')->onDelete('cascade');
            $table->json('address')->nullable();
            $table->string('tax_id', 50)->nullable();
            $table->string('country', 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('currency');
        });
        Schema::dropIfExists('billing_details');
    }
};
