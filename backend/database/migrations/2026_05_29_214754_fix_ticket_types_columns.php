<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('ticket_types', function (Blueprint $table) {
            if (Schema::hasColumn('ticket_types', 'name_fr') && !Schema::hasColumn('ticket_types', 'name')) {
                // We'll rename it and change to json later or just drop and recreate since it's empty
                $table->dropColumn('name_fr');
                $table->json('name')->after('code');
            }
        });
        
        // Ensure description is JSON (if supported/needed, though TEXT might be fine in some DBs, 
        // since we are just storing json strings and the accessor handles it).
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ticket_types', function (Blueprint $table) {
            if (Schema::hasColumn('ticket_types', 'name')) {
                $table->dropColumn('name');
                $table->string('name_fr')->after('code');
            }
        });
    }
};
