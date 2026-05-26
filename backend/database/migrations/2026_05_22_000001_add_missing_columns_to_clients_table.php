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
            // Add full_name if it doesn't exist
            if (!Schema::hasColumn('clients', 'full_name')) {
                $table->string('full_name', 100)->nullable();
            }
            // Add avatar_path if it doesn't exist
            if (!Schema::hasColumn('clients', 'avatar_path')) {
                $table->string('avatar_path')->nullable();
            }
            // Add last_active_at if it doesn't exist
            if (!Schema::hasColumn('clients', 'last_active_at')) {
                $table->timestamp('last_active_at')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $columns = ['full_name', 'avatar_path', 'last_active_at'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('clients', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
