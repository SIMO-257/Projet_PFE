<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;


class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed ticket types first
        $this->call(TicketTypeSeeder::class);

        // User::factory(10)->create();

        // $client = \App\Models\Client::updateOrCreate(
        //     ['email' => 'test@example.com'],
        //     [
        //         'first_name' => 'Test',
        //         'last_name' => 'Client',
        //         'password_hash' => \Illuminate\Support\Facades\Hash::make('password'),
        //     ]
        // );

        // // Create a wallet only if it doesn't exist, to prevent resetting balance during seeds
        // \App\Models\Wallet::firstOrCreate(
        //     ['user_id' => $client->id],
        //     ['balance' => 100.00]
        // );

        // // Seed some tickets for the test user
        // $simpleTicketType = \App\Models\TicketType::where('code', 'BILLET_SIMPLE')->first();
        // if ($simpleTicketType) {
        //     \App\Models\Ticket::create([
        //         'uuid' => (string) \Illuminate\Support\Str::uuid(),
        //         'user_id' => $client->id,
        //         'ticket_type_id' => $simpleTicketType->id,
        //         'status' => 'active',
        //         'valid_from' => now(),
        //         'valid_until' => now()->addDays(1),
        //         'remaining_uses' => 2,
        //         'price_paid' => $simpleTicketType->price,
        //     ]);
        // }

        // $carnetType = \App\Models\TicketType::where('code', 'BILLET_DOUBLE')->first();
        // if ($carnetType) {
        //     \App\Models\Ticket::create([
        //         'uuid' => (string) \Illuminate\Support\Str::uuid(),
        //         'user_id' => $client->id,
        //         'ticket_type_id' => $carnetType->id,
        //         'status' => 'active',
        //         'valid_from' => now(),
        //         'valid_until' => now()->addDays(7),
        //         'remaining_uses' => 4,
        //         'price_paid' => $carnetType->price,
        //     ]);
        // }

        // // Rename old types to "Billet" before deactivating to ensure existing tickets show the new name
        // \App\Models\TicketType::whereIn('code', ['BILLET_SIMPLE', 'BILLET_DOUBLE', 'BILLET_SEMAINE', 'BILLET_MOIS'])
        //     ->update([
        //         'name_fr' => 'Billet',
        //         'is_active' => false
        //     ]);

        // // Deactivate all other existing types
        // \App\Models\TicketType::whereNotIn('code', ['VOYAGE_ALLEZ', 'VOYAGE_RETOUR', 'VOYAGE_REGULIER'])
        //     ->update(['is_active' => false]);

        // // Seed Ticket Types
        // $types = [
        //     [
        //         'code' => 'BILLET_SIMPLE',
        //         'name_fr' => 'Billet',
        //         'description' => 'Valable pour un trajet avec 2 correspondances.',
        //         'price' => 8.00,
        //         'duration_minutes' => 10080,
        //         'is_reusable' => false,
        //         'max_uses' => 2,
        //         'is_active' => true,
        //     ],
        //     [
        //         'code' => 'BILLET_DOUBLE',
        //         'name_fr' => 'Carte Normale (A/R)',
        //         'description' => 'Valable pour un trajet aller-retour.',
        //         'price' => 14.00,
        //         'duration_minutes' => 10080,
        //         'is_reusable' => false,
        //         'max_uses' => 4,
        //         'is_active' => true,
        //     ],
        //     [
        //         'code' => 'BILLET_SEMAINE',
        //         'name_fr' => 'Billet de Semaine',
        //         'description' => 'Voyages illimités pendant 7 jours.',
        //         'price' => 70.00,
        //         'duration_minutes' => 10080,
        //         'is_reusable' => true,
        //         'max_uses' => 999,
        //         'is_active' => true,
        //     ],
        //     [
        //         'code' => 'BILLET_MOIS',
        //         'name_fr' => 'Billet de Mois',
        //         'description' => 'Voyages illimités pendant 30 jours.',
        //         'price' => 250.00,
        //         'duration_minutes' => 43200,
        //         'is_reusable' => true,
        //         'max_uses' => 999,
        //         'is_active' => true,
        //     ],
        // ];

        // foreach ($types as $type) {
        //     \App\Models\TicketType::updateOrCreate(
        //         ['code' => $type['code']],
        //         $type
        //     );
        // }



    }
}
