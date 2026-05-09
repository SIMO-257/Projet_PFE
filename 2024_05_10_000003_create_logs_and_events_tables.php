<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('validation_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->nullable()->constrained('tickets');
            $table->foreignId('user_id')->constrained('clients');
            $table->string('validator_id');
            $table->string('validation_type'); // nfc, qr
            $table->string('status'); // success, failure
            $table->text('failure_reason')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('processed_stripe_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_id')->unique();
            $table->timestamp('processed_at')->useCurrent();
        });
    }
    public function down() { 
        Schema::dropIfExists('validation_logs'); 
        Schema::dropIfExists('processed_stripe_events'); 
    }
};
