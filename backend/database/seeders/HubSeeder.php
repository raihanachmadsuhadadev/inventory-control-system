<?php

namespace Database\Seeders;

use App\Models\Hub;
use Illuminate\Database\Seeder;

class HubSeeder extends Seeder
{
    /**
     * Seed initial hubs.
     */
    public function run(): void
    {
        $hubs = [
            ['name' => 'Gudang Pusat', 'code' => 'HUB-PST', 'address' => 'Jl. Inventory Raya No. 1, Jakarta Timur', 'description' => 'Hub utama untuk konsolidasi stok nasional.'],
            ['name' => 'Hub Jakarta Selatan', 'code' => 'HUB-JS', 'address' => 'Jl. Distribusi Selatan No. 12, Jakarta Selatan', 'description' => 'Hub distribusi area Jakarta Selatan.'],
            ['name' => 'Hub Bandung', 'code' => 'HUB-BDG', 'address' => 'Jl. Logistik Bandung No. 8, Bandung', 'description' => 'Hub distribusi area Bandung dan sekitarnya.'],
            ['name' => 'Hub Surabaya', 'code' => 'HUB-SBY', 'address' => 'Jl. Pergudangan Rungkut No. 18, Surabaya', 'description' => 'Hub distribusi area Jawa Timur.'],
            ['name' => 'Hub Medan', 'code' => 'HUB-MDN', 'address' => 'Jl. Industri Deli No. 5, Medan', 'description' => 'Hub distribusi area Sumatera Utara.'],
        ];

        foreach ($hubs as $hub) {
            Hub::updateOrCreate(
                ['code' => $hub['code']],
                $hub + ['is_active' => true],
            );
        }
    }
}
