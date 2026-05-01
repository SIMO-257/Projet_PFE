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
        Schema::table('transactions', function (Blueprint $table) {
            // SQLite doesn't support changing columns easily, so we add a new one if it's a simple update
            // But for a cleaner approach in a dev environment, we can use string instead of enum if we want to expand
            $table->string('type', 20)->change();
            $table->string('status', 20)->default('completed')->after('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('status');
            // Reverting to enum might be tricky depending on the DB driver
        });
    }
};
