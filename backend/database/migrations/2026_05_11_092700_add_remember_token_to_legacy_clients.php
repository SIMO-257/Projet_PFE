<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('clients') && !Schema::hasColumn('clients', 'remember_token')) {
            Schema::table('clients', function (Blueprint $table): void {
                $table->rememberToken();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('clients') && Schema::hasColumn('clients', 'remember_token')) {
            Schema::table('clients', function (Blueprint $table): void {
                $table->dropColumn('remember_token');
            });
        }
    }
};

