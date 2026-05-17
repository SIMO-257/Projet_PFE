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
        DB::unprepared('
            CREATE EVENT IF NOT EXISTS delete_expired_tickets_daily
            ON SCHEDULE EVERY 1 DAY
            DO
                DELETE FROM tickets WHERE status = "expired"
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP EVENT IF EXISTS delete_expired_tickets_daily');
    }
};
