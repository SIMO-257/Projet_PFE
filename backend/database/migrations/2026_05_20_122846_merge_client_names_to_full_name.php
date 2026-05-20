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
        // 1. Add full_name as nullable first so we can backfill
        Schema::table('clients', function (Blueprint $table) {
            $table->string('full_name')->nullable()->after('email');
        });

        Schema::table('pending_registrations', function (Blueprint $table) {
            $table->string('full_name')->nullable()->after('email');
        });

        // 2. Backfill full_name using concatenated first_name and last_name
        DB::table('clients')->update([
            'full_name' => DB::raw("TRIM(CONCAT(IFNULL(first_name, ''), ' ', IFNULL(last_name, '')))")
        ]);

        DB::table('pending_registrations')->update([
            'full_name' => DB::raw("TRIM(CONCAT(IFNULL(first_name, ''), ' ', IFNULL(last_name, '')))")
        ]);

        // Fallback for empty names to ensure not-null constraint passes
        DB::table('clients')->whereNull('full_name')->orWhere('full_name', '')->update(['full_name' => 'Utilisateur']);
        DB::table('pending_registrations')->whereNull('full_name')->orWhere('full_name', '')->update(['full_name' => 'Utilisateur']);

        // 3. Make full_name non-nullable and drop first_name & last_name
        Schema::table('clients', function (Blueprint $table) {
            $table->string('full_name')->nullable(false)->change();
            $table->dropColumn(['first_name', 'last_name']);
        });

        Schema::table('pending_registrations', function (Blueprint $table) {
            $table->string('full_name')->nullable(false)->change();
            $table->dropColumn(['first_name', 'last_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->string('first_name', 100)->nullable()->after('email');
            $table->string('last_name', 100)->nullable()->after('first_name');
        });

        Schema::table('pending_registrations', function (Blueprint $table) {
            $table->string('first_name')->nullable()->after('email');
            $table->string('last_name')->nullable()->after('first_name');
        });

        // Split full_name (naive approach: split by first space)
        $clients = DB::table('clients')->get();
        foreach ($clients as $client) {
            $parts = explode(' ', $client->full_name, 2);
            DB::table('clients')->where('id', $client->id)->update([
                'first_name' => $parts[0] ?? null,
                'last_name' => $parts[1] ?? null,
            ]);
        }

        $pendings = DB::table('pending_registrations')->get();
        foreach ($pendings as $pending) {
            $parts = explode(' ', $pending->full_name, 2);
            DB::table('pending_registrations')->where('id', $pending->id)->update([
                'first_name' => $parts[0] ?? null,
                'last_name' => $parts[1] ?? null,
            ]);
        }

        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn('full_name');
        });

        Schema::table('pending_registrations', function (Blueprint $table) {
            $table->dropColumn('full_name');
        });
    }
};
