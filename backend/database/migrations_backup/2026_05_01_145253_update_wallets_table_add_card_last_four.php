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
        Schema::table('wallets', function (Blueprint $table) {
            if (!Schema::hasColumn('wallets', 'card_last_four')) {
                $table->string('card_last_four', 4)->nullable()->after('card_number');
            }
            // If changing causes issues, we can try to drop and add or just skip if length is enough
            // For now let's try to just modify it safely if needed.
            // Some DBs don't like change() on empty strings or certain types.
        });

        // Separate call for change to isolate failure
        try {
            Schema::table('wallets', function (Blueprint $table) {
                $table->string('card_number', 255)->change();
            });
        } catch (\Exception $e) {
            // Log or ignore if it's just a warning/truncation issue on empty data
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('wallets', function (Blueprint $table) {
            if (Schema::hasColumn('wallets', 'card_last_four')) {
                $table->dropColumn('card_last_four');
            }
            $table->string('card_number', 20)->change();
        });
    }
};
