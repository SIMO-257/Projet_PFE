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

        // User::factory(10)->create();

        $client = \App\Models\Client::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'first_name' => 'Test',
                'last_name' => 'Client',
                'password_hash' => \Illuminate\Support\Facades\Hash::make('password'),
            ]
        );

        // Create a wallet only if it doesn't exist, to prevent resetting balance during seeds
        \App\Models\Wallet::firstOrCreate(
            ['user_id' => $client->id],
            ['balance' => 100.00]
        );

        // Rename old types to "Billet" before deactivating to ensure existing tickets show the new name
        \App\Models\TicketType::whereIn('code', ['VOYAGE_ALLEZ', 'VOYAGE_RETOUR', 'VOYAGE_REGULIER'])
            ->update([
                'name_fr' => 'Billet',
                'name_ar' => 'تذكرة',
                'is_active' => false
            ]);

        // Deactivate all other existing types
        \App\Models\TicketType::whereNotIn('code', ['VOYAGE_ALLEZ', 'VOYAGE_RETOUR', 'VOYAGE_REGULIER'])
            ->update(['is_active' => false]);

        // Seed Ticket Types
        $types = [
            [
                'code' => 'BILLET_SIMPLE',
                'name_fr' => 'Billet',
                'name_ar' => 'تذكرة',
                'description' => 'Valable pour un trajet avec 2 correspondances dans les 5 minutes.',
                'price' => 8.00,
                'duration_minutes' => 5,
                'is_reusable' => false,
                'max_uses' => 1,
                'is_active' => true,
            ],
            [
                'code' => 'CARTE_NORMALE',
                'name_fr' => 'Carte Normale (A/R)',
                'name_ar' => 'بطاقة عادية',
                'description' => 'Valable pour un trajet aller-retour (120 min total).',
                'price' => 14.00,
                'duration_minutes' => 120,
                'is_reusable' => false,
                'max_uses' => 2,
                'is_active' => true,
            ],
            [
                'code' => 'CARTE_RECHARGE',
                'name_fr' => 'Voyage (Recharge)',
                'name_ar' => 'تعبئة',
                'description' => 'Voyage à 6 DH avec 2 correspondances dans les 30 minutes.',
                'price' => 6.00,
                'duration_minutes' => 30,
                'is_reusable' => false,
                'max_uses' => 1,
                'is_active' => true,
            ],
            [
                'code' => 'BILLET_SEMAINE',
                'name_fr' => 'Billet de Semaine',
                'name_ar' => 'تذكرة أسبوعية',
                'description' => 'Voyages illimités pendant 7 jours.',
                'price' => 70.00,
                'duration_minutes' => 10080,
                'is_reusable' => true,
                'max_uses' => 999,
                'is_active' => true,
            ],
            [
                'code' => 'BILLET_MOIS',
                'name_fr' => 'Billet de Mois',
                'name_ar' => 'تذكرة شهرية',
                'description' => 'Voyages illimités pendant 30 jours.',
                'price' => 250.00,
                'duration_minutes' => 43200,
                'is_reusable' => true,
                'max_uses' => 999,
                'is_active' => true,
            ],
        ];

        foreach ($types as $type) {
            \App\Models\TicketType::updateOrCreate(
                ['code' => $type['code']],
                $type
            );
        }


        $this->call([
            ClientSeeder::class,
        ]);
    }
}
