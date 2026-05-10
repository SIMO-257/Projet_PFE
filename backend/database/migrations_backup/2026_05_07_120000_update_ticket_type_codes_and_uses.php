<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Ensure ticket type id=2 is renamed and updated as requested.
        DB::table('ticket_types')
            ->where('id', 2)
            ->update([
                'code' => 'BILLET_DOUBLE',
                'max_uses' => 4,
            ]);

        // Ensure "normal ticket" (BILLET_SIMPLE) has 2 uses.
        DB::table('ticket_types')
            ->where('code', 'BILLET_SIMPLE')
            ->update([
                'max_uses' => 2,
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('ticket_types')
            ->where('id', 2)
            ->update([
                'code' => 'CARTE_NORMALE',
                'max_uses' => 2,
            ]);

        DB::table('ticket_types')
            ->where('code', 'BILLET_SIMPLE')
            ->update([
                'max_uses' => 1,
            ]);
    }
};

