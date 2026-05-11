<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('clients')) {
            Schema::table('clients', function (Blueprint $table): void {
                if (!Schema::hasColumn('clients', 'profile_file')) {
                    $table->binary('profile_file')->nullable()->after('last_name');
                }
                if (!Schema::hasColumn('clients', 'remember_me')) {
                    $table->boolean('remember_me')->default(false)->after('is_active');
                }
                if (!Schema::hasColumn('clients', 'fcm_token')) {
                    $table->string('fcm_token')->nullable()->after('remember_me');
                }
                // Skip default_ticket_id - it's handled by a dedicated migration
                // to avoid circular foreign key dependencies
                if (!Schema::hasColumn('clients', 'notification_prefs')) {
                    $table->json('notification_prefs')->nullable();
                }
                if (!Schema::hasColumn('clients', 'client_preferences')) {
                    $table->json('client_preferences')->nullable();
                }
            });
        }

        if (!Schema::hasTable('audit_logs')) {
            Schema::create('audit_logs', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('action');
                $table->ipAddress('ip_address')->nullable();
                $table->text('user_agent')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('clients')) {
            Schema::table('clients', function (Blueprint $table): void {
                $columns = [
                    'profile_file',
                    'remember_me',
                    'fcm_token',
                    'default_ticket_id',
                    'notification_prefs',
                    'client_preferences',
                ];

                foreach ($columns as $column) {
                    if (Schema::hasColumn('clients', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }

        Schema::dropIfExists('audit_logs');
    }
};

