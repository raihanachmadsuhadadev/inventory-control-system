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
            [
                'name' => 'Gudang Pusat',
                'code' => 'HUB-PST',
                'address' => 'Jl. Inventory Raya No. 1',
                'description' => 'Hub utama untuk konsolidasi stok.',
            ],
            [
                'name' => 'Hub Jakarta Selatan',
                'code' => 'HUB-JS',
                'address' => 'Jl. Distribusi Selatan No. 12',
                'description' => 'Hub distribusi area Jakarta Selatan.',
            ],
            [
                'name' => 'Hub Bandung',
                'code' => 'HUB-BDG',
                'address' => 'Jl. Logistik Bandung No. 8',
                'description' => 'Hub distribusi area Bandung.',
            ],
        ];

        foreach ($hubs as $hub) {
            Hub::updateOrCreate(
                ['code' => $hub['code']],
                $hub + ['is_active' => true],
            );
        }
    }
}
