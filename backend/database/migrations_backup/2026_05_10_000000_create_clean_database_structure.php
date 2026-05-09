<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Intentionally left empty.
        // This migration originally duplicated clients table creation and could
        // break fresh migrate runs. Schema is defined by earlier table-specific migrations.
    }

    public function down(): void
    {
        // No-op: up() does not create any schema.
    }
};
