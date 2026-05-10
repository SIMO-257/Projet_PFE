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
            // Add only if these columns do not already exist on the clients table
            if (!Schema::hasColumn('clients', 'email_verified_at')) {
                $table->timestamp('email_verified_at')->nullable()->after('email');
            }
            if (!Schema::hasColumn('clients', 'email_verification_token')) {
                $table->string('email_verification_token')->nullable()->after('email_verified_at');
            }
            if (!Schema::hasColumn('clients', 'email_verification_sent_at')) {
                $table->timestamp('email_verification_sent_at')->nullable()->after('email_verification_token');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn(['email_verified_at', 'email_verification_token', 'email_verification_sent_at']);
        });
    }
};
