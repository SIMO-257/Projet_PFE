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
        if (!Schema::hasTable('tickets') || Schema::hasColumn('tickets', 'secure_token')) {
            return;
        }

        Schema::table('tickets', function (Blueprint $table): void {
            $table->string('secure_token', 255)->nullable()->after('uuid');
            $table->index('secure_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('tickets') || !Schema::hasColumn('tickets', 'secure_token')) {
            return;
        }

        Schema::table('tickets', function (Blueprint $table): void {
            $table->dropIndex('tickets_secure_token_index');
            $table->dropColumn('secure_token');
        });
    }
};

