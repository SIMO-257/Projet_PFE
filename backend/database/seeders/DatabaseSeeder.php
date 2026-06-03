<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Database\Seeders\TicketTypeSeeder;
use Database\Seeders\AdminSeeder;



class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed ticket types first
        $this->call([
            TicketTypeSeeder::class,
            AdminSeeder::class,
        ]);

        // Seed random users for development/testing
        if (app()->environment('local', 'development')) {
            $this->call(RandomUsersSeeder::class);
        }
    }
}
