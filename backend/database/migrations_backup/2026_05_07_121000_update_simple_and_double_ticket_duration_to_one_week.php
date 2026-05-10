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
        DB::table('ticket_types')
            ->whereIn('code', ['BILLET_SIMPLE', 'BILLET_DOUBLE'])
            ->update([
                'duration_minutes' => 10080,
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('ticket_types')
            ->where('code', 'BILLET_SIMPLE')
            ->update([
                'duration_minutes' => 5,
            ]);

        DB::table('ticket_types')
            ->whereIn('code', ['BILLET_DOUBLE', 'CARTE_NORMALE'])
            ->update([
                'duration_minutes' => 120,
            ]);
    }
};

