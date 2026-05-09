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
        if (!Schema::hasColumn('clients', 'notification_prefs')) {
            Schema::table('clients', function (Blueprint $table) {
                $table->json('notification_prefs')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('clients', 'notification_prefs')) {
            Schema::table('clients', function (Blueprint $table) {
                $table->dropColumn('notification_prefs');
            });
        }
    }
};
