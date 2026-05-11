<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('tickets') && !Schema::hasColumn('tickets', 'secure_token')) {
            Schema::table('tickets', function (Blueprint $table): void {
                $table->string('secure_token', 255)->nullable()->after('uuid');
                $table->index('secure_token');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('tickets') && Schema::hasColumn('tickets', 'secure_token')) {
            Schema::table('tickets', function (Blueprint $table): void {
                $table->dropIndex(['secure_token']);
                $table->dropColumn('secure_token');
            });
        }
    }
};

