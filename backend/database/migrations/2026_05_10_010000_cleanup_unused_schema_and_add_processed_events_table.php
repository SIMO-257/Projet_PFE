<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Remove unused tables/columns and add missing operational table.
     */
    public function up(): void
    {
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

        if (Schema::hasTable('wallets')) {
            Schema::table('wallets', function (Blueprint $table) {
                if (Schema::hasColumn('wallets', 'card_number')) {
                    $table->dropColumn('card_number');
                }
                if (Schema::hasColumn('wallets', 'card_last_four')) {
                    $table->dropColumn('card_last_four');
                }
            });
        }

        if (Schema::hasTable('clients')) {
            Schema::table('clients', function (Blueprint $table) {
                if (Schema::hasColumn('clients', 'remember_token')) {
                    $table->dropColumn('remember_token');
                }
            });
        }

        Schema::dropIfExists('blacklisted_tokens');
        Schema::dropIfExists('user_devices');

        if (!Schema::hasTable('processed_stripe_events')) {
            Schema::create('processed_stripe_events', function (Blueprint $table) {
                $table->id();
                $table->string('event_id')->unique();
                $table->timestamp('processed_at')->useCurrent();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('tickets')) {
            Schema::table('tickets', function (Blueprint $table) {
                if (!Schema::hasColumn('tickets', 'secure_token')) {
                    $table->text('secure_token')->nullable()->after('uuid');
                }
                if (!Schema::hasColumn('tickets', 'jws_signature')) {
                    $table->text('jws_signature')->nullable()->after('price_paid');
                }
            });
        }

        if (Schema::hasTable('wallets')) {
            Schema::table('wallets', function (Blueprint $table) {
                if (!Schema::hasColumn('wallets', 'card_number')) {
                    $table->string('card_number', 255)->nullable()->after('balance');
                }
                if (!Schema::hasColumn('wallets', 'card_last_four')) {
                    $table->string('card_last_four', 4)->nullable()->after('card_number');
                }
            });
        }

        if (Schema::hasTable('clients')) {
            Schema::table('clients', function (Blueprint $table) {
                if (!Schema::hasColumn('clients', 'remember_token')) {
                    $table->string('remember_token', 100)->nullable();
                }
            });
        }

        if (!Schema::hasTable('user_devices')) {
            Schema::create('user_devices', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('clients')->onDelete('cascade');
                $table->string('device_id')->unique();
                $table->enum('device_type', ['android', 'ios']);
                $table->string('hce_token', 255)->nullable();
                $table->timestamp('last_used_at')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('blacklisted_tokens')) {
            Schema::create('blacklisted_tokens', function (Blueprint $table) {
                $table->id();
                $table->uuid('ticket_uuid');
                $table->text('jws_signature')->nullable();
                $table->string('reason', 100);
                $table->timestamp('expires_at')->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->index('ticket_uuid');
                $table->index('expires_at');
                $table->foreign('ticket_uuid')->references('uuid')->on('tickets');
            });
        }

        Schema::dropIfExists('processed_stripe_events');
    }
};
