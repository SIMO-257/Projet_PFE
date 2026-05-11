<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration adds the default_ticket_id foreign key to clients table
     * AFTER the tickets table has been created to avoid circular dependency issues.
     */
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            // Add the column if it doesn't exist
            if (!Schema::hasColumn('clients', 'default_ticket_id')) {
                $table->foreignId('default_ticket_id')
                    ->nullable()
                    ->after('client_preferences')
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
            $table->dropConstrainedForeignId('default_ticket_id');
        });
    }
};
