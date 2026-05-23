<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop secure_token from tickets table
        if (Schema::hasTable('tickets') && Schema::hasColumn('tickets', 'secure_token')) {
            Schema::table('tickets', function (Blueprint $table) {
                $table->dropIndex(['secure_token']);
                $table->dropColumn('secure_token');
            });
        }

        // Drop remember_me from clients table
        if (Schema::hasTable('clients') && Schema::hasColumn('clients', 'remember_me')) {
            Schema::table('clients', function (Blueprint $table) {
                $table->dropColumn('remember_me');
            });
        }

        // Drop remember_token from clients table
        if (Schema::hasTable('clients') && Schema::hasColumn('clients', 'remember_token')) {
            Schema::table('clients', function (Blueprint $table) {
                $table->dropColumn('remember_token');
            });
        }
    }

    public function down(): void
    {
        // Restore secure_token
        if (Schema::hasTable('tickets') && !Schema::hasColumn('tickets', 'secure_token')) {
            Schema::table('tickets', function (Blueprint $table) {
                $table->string('secure_token', 255)->nullable()->after('uuid');
                $table->index('secure_token');
            });
        }

        // Restore remember_me
        if (Schema::hasTable('clients') && !Schema::hasColumn('clients', 'remember_me')) {
            Schema::table('clients', function (Blueprint $table) {
                $table->boolean('remember_me')->default(false)->after('is_active');
            });
        }

        // Restore remember_token
        if (Schema::hasTable('clients') && !Schema::hasColumn('clients', 'remember_token')) {
            Schema::table('clients', function (Blueprint $table) {
                $table->string('remember_token', 100)->nullable()->after('password_hash');
            });
        }
    }
};
