<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Only create if no admin exists yet
        if (Admin::where('email', 'admin@casaway.ma')->exists()) {
            $this->command->info('Admin already exists — skipping.');
            return;
        }

        Admin::create([
            'first_name' => 'Admin',
            'last_name'  => 'CasaWay',
            'email'      => 'admin@casaway.ma',
            'password'   => 'Admin@CasaWay2026!', // 'hashed' cast auto-hashes this
            'is_active'  => true,
        ]);

        $this->command->info('Admin created: admin@casaway.ma / Admin@CasaWay2026!');
    }
}
