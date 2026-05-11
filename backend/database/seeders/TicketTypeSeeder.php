<?php

namespace Database\Seeders;

use App\Models\TicketType;
use Illuminate\Database\Seeder;

class TicketTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ticketTypes = [
            [
                'id' => 1,
                'code' => 'BILLET_SIMPLE',
                'name_fr' => 'Billet Normal',
                'description' => 'Valable pour un trajet avec 2 correspondances.',
                'price' => 8.00,
                'duration_minutes' => 10080,
                'is_reusable' => 0,
                'max_uses' => 1,
                'is_active' => 1,
            ],
            [
                'id' => 2,
                'code' => 'BILLET_DOUBLE',
                'name_fr' => 'Carte Aller/Retour (A/R)',
                'description' => 'Valable pour un trajet aller-retour.',
                'price' => 14.00,
                'duration_minutes' => 10080,
                'is_reusable' => 0,
                'max_uses' => 2,
                'is_active' => 1,
            ],
            [
                'id' => 4,
                'code' => 'BILLET_SEMAINE',
                'name_fr' => 'Billet de Semaine',
                'description' => 'Voyages illimités pendant 7 jours.',
                'price' => 70.00,
                'duration_minutes' => 10080,
                'is_reusable' => 1,
                'max_uses' => 999,
                'is_active' => 1,
            ],
            [
                'id' => 5,
                'code' => 'BILLET_MOIS',
                'name_fr' => 'Billet de Mois',
                'description' => 'Voyages illimités pendant 30 jours.',
                'price' => 250.00,
                'duration_minutes' => 43200,
                'is_reusable' => 1,
                'max_uses' => 999,
                'is_active' => 1,
            ],
        ];

        foreach ($ticketTypes as $type) {
            TicketType::updateOrCreate(
                ['code' => $type['code']],
                $type
            );
        }
    }
}
