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
        if (!Schema::hasTable('clients') || !Schema::hasTable('tickets') || Schema::hasColumn('clients', 'default_ticket_id')) {
            return;
        }

        Schema::table('clients', function (Blueprint $table): void {
            $table->foreignId('default_ticket_id')
                ->nullable()
                ->constrained('tickets')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('clients') || !Schema::hasColumn('clients', 'default_ticket_id')) {
            return;
        }

        Schema::table('clients', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('default_ticket_id');
        });
    }
};

