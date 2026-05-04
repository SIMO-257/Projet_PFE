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
        // 1. Add specific payment_intent_id for Stripe with unique constraint
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('payment_intent_id', 100)->nullable()->unique()->after('uuid');
        });

        // 2. Create a table to track processed Stripe Event IDs to prevent replay attacks
        Schema::create('processed_stripe_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_id')->unique();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('payment_intent_id');
        });
        Schema::dropIfExists('processed_stripe_events');
    }
};
