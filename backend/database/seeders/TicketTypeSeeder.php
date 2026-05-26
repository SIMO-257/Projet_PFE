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
                'name' => [
                    'fr' => 'Billet Normal',
                    'en' => 'Standard Ticket',
                    'ar' => 'تذكرة عادية',
                ],
                'description' => [
                    'fr' => 'Valable pour un trajet avec 2 correspondances.',
                    'en' => 'Valid for one trip with 2 connections.',
                    'ar' => 'صالحة لرحلة واحدة مع وصلتين',
                ],
                'price' => 8.00,
                'duration_minutes' => 10080,
                'is_reusable' => 0,
                'max_uses' => 2,
                'is_active' => 1,
            ],
            [
                'id' => 2,
                'code' => 'BILLET_DOUBLE',
                'name' => [
                    'fr' => 'Carte Aller/Retour (A/R)',
                    'en' => 'Round Trip Card',
                    'ar' => 'بطاقة ذهاب وإياب',
                ],
                'description' => [
                    'fr' => 'Valable pour un trajet aller-retour.',
                    'en' => 'Valid for a round trip.',
                    'ar' => 'صالحة لرحلة ذهاب وإياب',
                ],
                'price' => 14.00,
                'duration_minutes' => 10080,
                'is_reusable' => 0,
                'max_uses' => 4,
                'is_active' => 1,
            ],
            [
                'id' => 4,
                'code' => 'BILLET_SEMAINE',
                'name' => [
                    'fr' => 'Billet de Semaine',
                    'en' => 'Weekly Ticket',
                    'ar' => 'تذكرة أسبوعية',
                ],
                'description' => [
                    'fr' => 'Voyages illimités pendant 7 jours.',
                    'en' => 'Unlimited travel for 7 days.',
                    'ar' => 'سفر غير محدود لمدة 7 أيام',
                ],
                'price' => 70.00,
                'duration_minutes' => 10080,
                'is_reusable' => 1,
                'max_uses' => 999,
                'is_active' => 1,
            ],
            [
                'id' => 5,
                'code' => 'BILLET_MOIS',
                'name' => [
                    'fr' => 'Billet de Mois',
                    'en' => 'Monthly Ticket',
                    'ar' => 'تذكرة شهرية',
                ],
                'description' => [
                    'fr' => 'Voyages illimités pendant 30 jours.',
                    'en' => 'Unlimited travel for 30 days.',
                    'ar' => 'سفر غير محدود لمدة 30 يوماً',
                ],
                'price' => 250.00,
                'duration_minutes' => 43200,
                'is_reusable' => 1,
                'max_uses' => 999,
                'is_active' => 1,
            ],
        ];

        foreach ($ticketTypes as $type) {
            // Cast arrays to JSON for storage
            $type['name'] = json_encode($type['name']);
            $type['description'] = json_encode($type['description']);

            TicketType::updateOrCreate(
                ['code' => $type['code']],
                $type
            );
        }
    }
}
