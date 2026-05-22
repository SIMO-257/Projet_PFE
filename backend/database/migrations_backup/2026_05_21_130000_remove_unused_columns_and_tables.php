<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RemoveUnusedColumnsAndTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // clients.remember_token (keep remember_me)
        if (Schema::hasTable('clients') && Schema::hasColumn('clients', 'remember_token')) {
            Schema::table('clients', function (Blueprint $table) {
                $table->dropColumn('remember_token');
            });
        }

        // tickets.secure_token, tickets.jws_signature
        if (Schema::hasTable('tickets')) {
            Schema::table('tickets', function (Blueprint $table) {
                if (Schema::hasColumn('tickets', 'secure_token')) {
                    $table->dropColumn('secure_token');
                }
                if (Schema::hasColumn('tickets', 'jws_signature')) {
                    $table->dropColumn('jws_signature');
                }
            });
        }

        // wallets.card_number, wallets.card_last_four
        if (Schema::hasTable('wallets')) {
            Schema::table('wallets', function (Blueprint $table) {
                if (Schema::hasColumn('wallets', 'card_last_four')) {
                    $table->dropColumn('card_last_four');
                }
                if (Schema::hasColumn('wallets', 'card_number')) {
                    $table->dropColumn('card_number');
                }
            });
        }

        // ticket_types.name_ar (keep ticket_types.description per request)
        if (Schema::hasTable('ticket_types') && Schema::hasColumn('ticket_types', 'name_ar')) {
            Schema::table('ticket_types', function (Blueprint $table) {
                $table->dropColumn('name_ar');
            });
        }

        // Drop user_devices table (feature unused)
        if (Schema::hasTable('user_devices')) {
            Schema::dropIfExists('user_devices');
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // clients.remember_token
        if (Schema::hasTable('clients') && !Schema::hasColumn('clients', 'remember_token')) {
            Schema::table('clients', function (Blueprint $table) {
                $table->string('remember_token', 100)->nullable()->after('password_hash');
            });
        }

        // tickets.secure_token, tickets.jws_signature
        if (Schema::hasTable('tickets')) {
            Schema::table('tickets', function (Blueprint $table) {
                if (!Schema::hasColumn('tickets', 'secure_token')) {
                    $table->string('secure_token', 255)->nullable()->after('uuid');
                }
                if (!Schema::hasColumn('tickets', 'jws_signature')) {
                    $table->text('jws_signature')->nullable()->after('secure_token');
                }
            });
        }

        // wallets.card_number, wallets.card_last_four
        if (Schema::hasTable('wallets')) {
            Schema::table('wallets', function (Blueprint $table) {
                if (!Schema::hasColumn('wallets', 'card_last_four')) {
                    $table->string('card_last_four', 4)->nullable()->after('balance');
                }
                if (!Schema::hasColumn('wallets', 'card_number')) {
                    $table->string('card_number')->nullable()->after('card_last_four');
                }
            });
        }

        // ticket_types.name_ar
        if (Schema::hasTable('ticket_types') && !Schema::hasColumn('ticket_types', 'name_ar')) {
            Schema::table('ticket_types', function (Blueprint $table) {
                $table->string('name_ar')->nullable()->after('name_fr');
            });
        }

        // recreate user_devices table if missing
        if (!Schema::hasTable('user_devices')) {
            Schema::create('user_devices', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->index();
                $table->string('device_id')->unique();
                $table->string('device_type')->nullable();
                $table->string('hce_token')->nullable();
                $table->timestamp('last_used_at')->nullable();
                $table->timestamps();
            });
        }
    }
}
