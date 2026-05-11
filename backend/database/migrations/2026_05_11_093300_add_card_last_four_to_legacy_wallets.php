<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('wallets') && !Schema::hasColumn('wallets', 'card_last_four')) {
            Schema::table('wallets', function (Blueprint $table): void {
                $table->string('card_last_four', 4)->nullable()->after('balance');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('wallets') && Schema::hasColumn('wallets', 'card_last_four')) {
            Schema::table('wallets', function (Blueprint $table): void {
                $table->dropColumn('card_last_four');
            });
        }
    }
};

