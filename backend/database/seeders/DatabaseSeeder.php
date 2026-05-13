<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Database\Seeders\TicketTypeSeeder;


class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed ticket types first
        $this->call([
            TicketTypeSeeder::class
        ]);

        
    }
}
