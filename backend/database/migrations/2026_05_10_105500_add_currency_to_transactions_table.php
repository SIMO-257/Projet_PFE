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
        if (!Schema::hasTable('transactions') || Schema::hasColumn('transactions', 'currency')) {
            return;
        }

        Schema::table('transactions', function (Blueprint $table): void {
            $table->string('currency', 3)->default('MAD')->after('amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('transactions') || !Schema::hasColumn('transactions', 'currency')) {
            return;
        }

        Schema::table('transactions', function (Blueprint $table): void {
            $table->dropColumn('currency');
        });
    }
};

