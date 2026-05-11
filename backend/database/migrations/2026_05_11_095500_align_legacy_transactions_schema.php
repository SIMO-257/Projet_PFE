<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('transactions')) {
            return;
        }

        if (!Schema::hasColumn('transactions', 'status')) {
            Schema::table('transactions', function (Blueprint $table): void {
                $table->string('status', 20)->default('completed')->after('type');
            });
        }

        if (!Schema::hasColumn('transactions', 'currency')) {
            Schema::table('transactions', function (Blueprint $table): void {
                $table->string('currency', 3)->default('MAD')->after('amount');
            });
        }

        if (!Schema::hasColumn('transactions', 'payment_intent_id')) {
            Schema::table('transactions', function (Blueprint $table): void {
                $table->string('payment_intent_id', 100)->nullable()->after('uuid');
            });
        }

        // Legacy schemas use ENUM('purchase','validation'); confirm flow writes type='recharge'.
        DB::statement("ALTER TABLE transactions MODIFY COLUMN type VARCHAR(20) NOT NULL");
    }

    public function down(): void
    {
        // No destructive rollback for legacy compatibility migration.
    }
};

