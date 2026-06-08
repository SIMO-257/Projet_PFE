<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Safely adds the pin_hash column if it doesn't already exist,
     * so this migration can be run multiple times without errors.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('users', 'pin_hash')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('pin_hash', 60)
                    ->nullable()
                    ->after('password_hash');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('users', 'pin_hash')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('pin_hash');
            });
        }
    }
};
