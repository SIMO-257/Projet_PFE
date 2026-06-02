<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\Ticket;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RandomUsersSeeder extends Seeder
{
    private array $firstNames = [
        'Ahmed', 'Fatima', 'Mohamed', 'Aisha', 'Youssef', 'Khadija', 'Omar', 'Sara',
        'Ali', 'Nadia', 'Hassan', 'Amine', 'Karim', 'Leila', 'Rachid', 'Salma',
        'Ibrahim', 'Mariam', 'Said', 'Noura', 'Hamza', 'Sanaa', 'Mehdi', 'Imane',
        'Reda', 'Hafsa', 'Zakaria', 'Mouna', 'Anas', 'Asmae', 'Hicham', 'Samira',
        'Adil', 'Malika', 'Tarik', 'Nawal', 'Ayoub', 'Zineb', 'Walid', 'Soukaina',
        'Simo', 'Hiba', 'Nabil', 'Rania', 'Mounir', 'Ghita', 'Yassine', 'Hind',
        'Badr', 'Douae',
    ];

    private array $lastNames = [
        'Alaoui', 'Benani', 'Idrissi', 'El Fassi', 'Bennani', 'Tazi', 'Berrada',
        'Guedira', 'Guessous', 'Slaoui', 'Kabbaj', 'Sebti', 'Belkhayat', 'Zniber',
        'Bouazza', 'El Amrani', 'Ouazzani', 'Chraibi', 'El Ouazzani', 'Fikri',
        'Bouabid', 'El Haddad', 'Meziane', 'El Khattabi', 'Benjelloun', 'Radi',
        'El Mansouri', 'Ameur', 'El Bakkali', 'Bencheikh', 'Touimi', 'Lahlou',
        'Rherras', 'Filali', 'El Malki', 'Baddou', 'Lahlou', 'Zemmouri', 'Ait Ali',
        'Bouanani',
    ];

    private function getPreferenceCombinations(): array
    {
        return [
            [
                'user_preferences'  => ['analytics_enabled' => true, 'auth_purchase' => false, 'pin_enabled' => false],
                'notification_prefs' => ['validation' => true, 'payment' => true, 'security' => true, 'promo' => false],
            ],
            [
                'user_preferences'  => ['analytics_enabled' => false, 'auth_purchase' => true, 'pin_enabled' => true],
                'notification_prefs' => ['validation' => true, 'payment' => true, 'security' => true, 'promo' => false],
            ],
            [
                'user_preferences'  => ['analytics_enabled' => true, 'auth_purchase' => false, 'pin_enabled' => false],
                'notification_prefs' => ['validation' => true, 'payment' => true, 'security' => false, 'promo' => true],
            ],
            [
                'user_preferences'  => ['analytics_enabled' => false, 'auth_purchase' => false, 'pin_enabled' => false],
                'notification_prefs' => ['validation' => false, 'payment' => true, 'security' => false, 'promo' => false],
            ],
            [
                'user_preferences'  => ['analytics_enabled' => true, 'auth_purchase' => true, 'pin_enabled' => true],
                'notification_prefs' => ['validation' => true, 'payment' => true, 'security' => true, 'promo' => false],
            ],
            [
                'user_preferences'  => ['analytics_enabled' => false, 'auth_purchase' => false, 'pin_enabled' => false],
                'notification_prefs' => ['validation' => false, 'payment' => false, 'security' => false, 'promo' => false],
            ],
            [
                'user_preferences'  => ['analytics_enabled' => true, 'auth_purchase' => true, 'pin_enabled' => true],
                'notification_prefs' => ['validation' => true, 'payment' => true, 'security' => true, 'promo' => true],
            ],
            [
                'user_preferences'  => ['analytics_enabled' => false, 'auth_purchase' => false, 'pin_enabled' => false],
                'notification_prefs' => ['validation' => true, 'payment' => false, 'security' => false, 'promo' => false],
            ],
        ];
    }

    private function randomDate(int $maxDaysAgo = 30): string
    {
        return now()->subDays(random_int(0, $maxDaysAgo))
            ->setTime(random_int(6, 22), random_int(0, 59), random_int(0, 59))
            ->format('Y-m-d H:i:s');
    }

    private function randomBalance(): float
    {
        return round(mt_rand(0, 20000) / 100, 2);
    }

    public function run(): void
    {
        $count = 50;
        $this->command->info("Creating {$count} random users with data...");

        $prefCombos = $this->getPreferenceCombinations();
        $ticketTypeIds = [1, 2, 4, 5];
        $ticketStatuses = ['active', 'used', 'expired'];
        $usedEmails = [];
        $usedPhones = [];

        for ($i = 0; $i < $count; $i++) {
            $firstName = $this->firstNames[array_rand($this->firstNames)];
            $lastName  = $this->lastNames[array_rand($this->lastNames)];
            $fullName  = "{$firstName} {$lastName}";

            do {
                $email = strtolower("{$firstName}.{$lastName}" . random_int(1, 9999)) . '@example.com';
            } while (in_array($email, $usedEmails));
            $usedEmails[] = $email;

            do {
                $phone = '+2126' . str_pad((string) random_int(0, 99999999), 8, '0', STR_PAD_LEFT);
            } while (in_array($phone, $usedPhones));
            $usedPhones[] = $phone;

            $combo = $prefCombos[array_rand($prefCombos)];
            $createdAt = $this->randomDate(45);

            $prefs = $combo['user_preferences'];
            if (random_int(0, 3) === 0) {
                $prefs['pin_enabled'] = !$prefs['pin_enabled'];
            }

            $notifPrefs = $combo['notification_prefs'];

            $isActive = random_int(0, 19) !== 0;
            $isStudent = random_int(0, 6) === 0;
            $emailVerifiedAt = random_int(0, 4) !== 0 ? $createdAt : null;

            $user = User::create([
                'uuid'                => (string) Str::uuid(),
                'full_name'           => $fullName,
                'email'               => $email,
                'phone'               => $phone,
                'password_hash'       => Hash::make('password'),
                'is_active'           => $isActive,
                'is_student'          => $isStudent,
                'email_verified_at'   => $emailVerifiedAt,
                'notification_prefs'  => $notifPrefs,
                'user_preferences'    => $prefs,
                'created_at'          => $createdAt,
                'updated_at'          => $createdAt,
            ]);

            // ─── Wallet ───
            $initialBalance = $this->randomBalance();
            Wallet::create([
                'user_id'    => $user->id,
                'balance'    => $initialBalance,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            // ─── Transactions (1–5 per user) ───
            $runningBalance = $initialBalance;
            $numTx = random_int(1, 5);
            for ($t = 0; $t < $numTx; $t++) {
                $txDate = $this->randomDate(30);
                $amount = round(mt_rand(500, 25000) / 100, 2);
                $status = random_int(0, 9) !== 0 ? 'completed' : 'failed';

                $balanceBefore = $runningBalance;
                $balanceAfter = $status === 'completed'
                    ? round($runningBalance + $amount, 2)
                    : $runningBalance;
                if ($status === 'completed') {
                    $runningBalance = $balanceAfter;
                }

                Transaction::create([
                    'uuid'           => (string) Str::uuid(),
                    'user_id'        => $user->id,
                    'type'           => 'recharge',
                    'status'         => $status,
                    'amount'         => $amount,
                    'currency'       => 'MAD',
                    'balance_before' => $balanceBefore,
                    'balance_after'  => $balanceAfter,
                    'payment_method' => ['stripe', 'cash', 'card'][random_int(0, 2)],
                    'reference'      => 'SEED-' . strtoupper(Str::random(10)),
                    'metadata'       => ['source' => 'seeder', 'simulated' => true],
                    'created_at'     => $txDate,
                ]);
            }

            // ─── Tickets (0–3 per user) ───
            $numTickets = random_int(0, 3);
            for ($tk = 0; $tk < $numTickets; $tk++) {
                $ticketDate = $this->randomDate(30);
                $ticketTypeId = $ticketTypeIds[array_rand($ticketTypeIds)];
                $status = $ticketStatuses[array_rand($ticketStatuses)];

                $priceMap = [1 => 8.00, 2 => 14.00, 4 => 70.00, 5 => 250.00];
                $price = $priceMap[$ticketTypeId];

                if ($isStudent && in_array($ticketTypeId, [4, 5])) {
                    $price = $ticketTypeId === 4 ? 40.00 : 150.00;
                }

                Ticket::create([
                    'uuid'           => (string) Str::uuid(),
                    'user_id'        => $user->id,
                    'ticket_type_id' => $ticketTypeId,
                    'status'         => $status,
                    'valid_from'     => $ticketDate,
                    'valid_until'    => date('Y-m-d H:i:s', strtotime($ticketDate . ' +7 days')),
                    'remaining_uses' => $status === 'active' ? random_int(1, 10) : 0,
                    'price_paid'     => $price,
                    'created_at'     => $ticketDate,
                    'updated_at'     => $ticketDate,
                ]);
            }

            if ($i % 10 === 9 || $i === $count - 1) {
                $this->command->info("  Created " . ($i + 1) . "/{$count} users...");
            }
        }

        $this->command->info('');
        $this->command->info('✅ Seeded ' . $count . ' random users with wallets, transactions, and tickets.');
        $this->command->info('   Login: any user email / password (all users have password_hash = bcrypt("password"))');
    }
}
