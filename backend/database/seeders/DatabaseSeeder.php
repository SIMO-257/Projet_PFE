<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $client = \App\Models\Client::factory()->create([
            'first_name' => 'Test',
            'last_name' => 'Client',
            'email' => 'test@example.com',
            'password_hash' => \Illuminate\Support\Facades\Hash::make('password'),
        ]);

        // Create a wallet with some balance for testing
        \App\Models\Wallet::create([
            'user_id' => $client->id,
            'balance' => 100.00,
        ]);

        // Seed Ticket Types
        \App\Models\TicketType::create([
            'code' => 'UNITAIRE',
            'name_fr' => 'Billet Unitaire',
            'name_ar' => 'تذكرة واحدة',
            'description' => 'Valable pour un seul voyage (60 min)',
            'price' => 6.00,
            'duration_minutes' => 60,
            'is_reusable' => false,
            'max_uses' => 1,
            'is_active' => true,
        ]);

        \App\Models\TicketType::create([
            'code' => 'JOURNEE',
            'name_fr' => 'Pass Journée',
            'name_ar' => 'بطاقة اليوم',
            'description' => 'Voyages illimités pendant 24 heures',
            'price' => 20.00,
            'duration_minutes' => 1440,
            'is_reusable' => true,
            'max_uses' => 99,
            'is_active' => true,
        ]);

        $this->call([
            ClientSeeder::class,
        ]);
    }
}
