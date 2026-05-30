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
        if (Schema::hasTable('users')) {
            // 1. Add modern columns
            Schema::table('users', function (Blueprint $table) {
                if (!Schema::hasColumn('users', 'email_verified_at')) {
                    $table->timestamp('email_verified_at')->nullable()->after('email_verification_token');
                }
                if (!Schema::hasColumn('users', 'full_name')) {
                    $table->string('full_name', 100)->nullable()->after('uuid');
                }
            });

            // 2. Identify all columns that might be blocking insertion (not null without default)
            // and make them nullable.
            $columns = DB::select("SHOW COLUMNS FROM users");
            
            // List of columns used by the current code (these should stay as defined)
            $modernColumns = [
                'id', 'uuid', 'full_name', 'phone', 'email', 'password_hash', 
                'is_active', 'is_student', 'email_verified_at', 'created_at', 'updated_at'
            ];

            Schema::table('users', function (Blueprint $table) use ($columns, $modernColumns) {
                foreach ($columns as $column) {
                    // If the column is NOT in our modern list AND it's NOT NULL, make it nullable
                    if (!in_array($column->Field, $modernColumns) && $column->Null === 'NO' && $column->Default === null && $column->Extra !== 'auto_increment') {
                        $table->string($column->Field)->nullable()->change();
                    }
                    
                    // Specific fix for 'password' vs 'password_hash'
                    if ($column->Field === 'password' && $column->Null === 'NO') {
                        $table->string('password')->nullable()->change();
                    }
                }
            });
        }

        // 3. Ensure 'pending_registrations' exists
        if (!Schema::hasTable('pending_registrations')) {
            Schema::create('pending_registrations', function (Blueprint $table) {
                $table->id();
                $table->string('email')->unique();
                $table->string('phone');
                $table->string('password_hash');
                $table->string('full_name')->nullable();
                $table->string('avatar_path')->nullable();
                $table->string('email_verification_code', 6)->nullable();
                $table->string('email_verification_token')->nullable();
                $table->timestamp('email_verification_sent_at')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    }
};
