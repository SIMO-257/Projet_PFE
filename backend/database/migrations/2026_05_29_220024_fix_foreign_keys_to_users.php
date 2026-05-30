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
        $tables = [
            'audit_logs' => 'audit_logs_user_id_foreign',
            'notifications' => 'notifications_user_id_foreign',
            'tickets' => 'tickets_user_id_foreign',
            'transactions' => 'transactions_user_id_foreign',
            'validation_logs' => 'validation_logs_user_id_foreign',
            'wallets' => 'wallets_user_id_foreign',
        ];

        foreach ($tables as $tableName => $fkName) {
            if (Schema::hasTable($tableName)) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName, $fkName) {
                    // Drop the existing foreign key to clients
                    DB::statement("ALTER TABLE `{$tableName}` DROP FOREIGN KEY `{$fkName}`");
                    
                    // Add new foreign key to users
                    $table->foreign('user_id', $fkName)->references('id')->on('users')->onDelete('cascade');
                });
            }
        }
        
        // Handle rapports / repports separately if they exist
        if (Schema::hasTable('rapports')) {
            Schema::table('rapports', function (Blueprint $table) {
                DB::statement("ALTER TABLE `rapports` DROP FOREIGN KEY `rapports_user_id_foreign`");
                $table->foreign('user_id', 'rapports_user_id_foreign')->references('id')->on('users')->onDelete('cascade');
            });
        }
        if (Schema::hasTable('repports')) {
            Schema::table('repports', function (Blueprint $table) {
                DB::statement("ALTER TABLE `repports` DROP FOREIGN KEY `repports_user_id_foreign`");
                $table->foreign('user_id', 'repports_user_id_foreign')->references('id')->on('users')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Not necessary for this fix
    }
};
