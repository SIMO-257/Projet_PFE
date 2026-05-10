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
        if (!Schema::hasTable('transactions')) {
            return;
        }

        if (!Schema::hasColumn('transactions', 'payment_intent_id')) {
            Schema::table('transactions', function (Blueprint $table): void {
                $table->string('payment_intent_id', 100)->nullable()->after('uuid');
                $table->unique('payment_intent_id');
                $table->index('payment_intent_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('transactions') || !Schema::hasColumn('transactions', 'payment_intent_id')) {
            return;
        }

        Schema::table('transactions', function (Blueprint $table): void {
            $table->dropUnique('transactions_payment_intent_id_unique');
            $table->dropIndex('transactions_payment_intent_id_index');
            $table->dropColumn('payment_intent_id');
        });
    }
};

