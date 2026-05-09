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
        Schema::table('clients', function (Blueprint $table) {
            if (!Schema::hasColumn('clients', 'default_ticket_id')) {
                $table->foreignId('default_ticket_id')
                    ->nullable()
                    ->after('remember_me')
                    ->constrained('tickets')
                    ->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            if (Schema::hasColumn('clients', 'default_ticket_id')) {
                $table->dropConstrainedForeignId('default_ticket_id');
            }
        });
    }
};
