<?php

namespace Database\Seeders;

use App\Models\Hub;
use App\Models\Inventory;
use App\Models\Product;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    /**
     * Seed initial inventories.
     */
    public function run(): void
    {
        $hubs = Hub::query()->whereIn('code', [
            'HUB-PST',
            'HUB-JS',
            'HUB-BDG',
            'HUB-SBY',
            'HUB-MDN',
        ])->get()->keyBy('code');

        if ($hubs->isEmpty()) {
            return;
        }

        $stocks = [
            'PRD-KOPI-001' => ['HUB-PST' => [96, 8], 'HUB-JS' => [42, 4], 'HUB-BDG' => [18, 2], 'HUB-SBY' => [57, 5], 'HUB-MDN' => [12, 1]],
            'PRD-KOPI-002' => ['HUB-PST' => [88, 7], 'HUB-JS' => [28, 3], 'HUB-BDG' => [64, 6], 'HUB-SBY' => [21, 2], 'HUB-MDN' => [10, 0]],
            'PRD-GULA-001' => ['HUB-PST' => [74, 6], 'HUB-JS' => [22, 2], 'HUB-BDG' => [16, 1], 'HUB-SBY' => [39, 3], 'HUB-MDN' => [9, 0]],
            'PRD-SYRUP-001' => ['HUB-PST' => [120, 10], 'HUB-JS' => [52, 4], 'HUB-BDG' => [28, 3], 'HUB-SBY' => [45, 4], 'HUB-MDN' => [14, 1]],
            'PRD-CUP-012' => ['HUB-PST' => [760, 40], 'HUB-JS' => [210, 15], 'HUB-BDG' => [118, 10], 'HUB-SBY' => [390, 24], 'HUB-MDN' => [82, 6]],
            'PRD-CUP-016' => ['HUB-PST' => [640, 35], 'HUB-JS' => [155, 12], 'HUB-BDG' => [98, 8], 'HUB-SBY' => [255, 18], 'HUB-MDN' => [70, 5]],
            'PRD-LID-012' => ['HUB-PST' => [900, 55], 'HUB-JS' => [260, 20], 'HUB-BDG' => [148, 12], 'HUB-SBY' => [430, 28], 'HUB-MDN' => [95, 7]],
            'PRD-PAPERBAG-001' => ['HUB-PST' => [360, 18], 'HUB-JS' => [92, 7], 'HUB-BDG' => [76, 6], 'HUB-SBY' => [140, 10], 'HUB-MDN' => [42, 3]],
            'PRD-SUSU-001' => ['HUB-PST' => [110, 9], 'HUB-JS' => [34, 3], 'HUB-BDG' => [24, 2], 'HUB-SBY' => [48, 4], 'HUB-MDN' => [13, 1]],
            'PRD-CREAMER-001' => ['HUB-PST' => [92, 7], 'HUB-JS' => [31, 3], 'HUB-BDG' => [19, 1], 'HUB-SBY' => [43, 4], 'HUB-MDN' => [11, 0]],
            'PRD-MATCHA-001' => ['HUB-PST' => [56, 5], 'HUB-JS' => [20, 2], 'HUB-BDG' => [15, 1], 'HUB-SBY' => [27, 2], 'HUB-MDN' => [8, 0]],
            'PRD-TEA-001' => ['HUB-PST' => [48, 4], 'HUB-JS' => [17, 1], 'HUB-BDG' => [13, 1], 'HUB-SBY' => [24, 2], 'HUB-MDN' => [7, 0]],
            'PRD-FRZ-001' => ['HUB-PST' => [75, 5], 'HUB-JS' => [26, 2], 'HUB-BDG' => [18, 1], 'HUB-SBY' => [39, 3], 'HUB-MDN' => [12, 1]],
            'PRD-FRZ-002' => ['HUB-PST' => [68, 5], 'HUB-JS' => [23, 2], 'HUB-BDG' => [17, 1], 'HUB-SBY' => [34, 3], 'HUB-MDN' => [10, 1]],
            'PRD-CLEAN-001' => ['HUB-PST' => [38, 2], 'HUB-JS' => [14, 1], 'HUB-BDG' => [9, 0], 'HUB-SBY' => [18, 1], 'HUB-MDN' => [6, 0]],
            'PRD-CLEAN-002' => ['HUB-PST' => [44, 2], 'HUB-JS' => [16, 1], 'HUB-BDG' => [11, 0], 'HUB-SBY' => [21, 1], 'HUB-MDN' => [7, 0]],
            'PRD-EQUIP-001' => ['HUB-PST' => [150, 8], 'HUB-JS' => [48, 3], 'HUB-BDG' => [33, 2], 'HUB-SBY' => [61, 4], 'HUB-MDN' => [20, 1]],
            'PRD-SPR-001' => ['HUB-PST' => [18, 1], 'HUB-JS' => [7, 0], 'HUB-BDG' => [5, 0], 'HUB-SBY' => [9, 1], 'HUB-MDN' => [3, 0]],
        ];

        foreach ($stocks as $productCode => $hubStocks) {
            $product = Product::query()->where('code', $productCode)->first();

            if (! $product) {
                continue;
            }

            foreach ($hubStocks as $hubCode => [$stock, $reserved]) {
                $hub = $hubs->get($hubCode);

                if (! $hub) {
                    continue;
                }

                Inventory::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'hub_id' => $hub->id,
                    ],
                    [
                        'current_stock' => $stock,
                        'reserved_stock' => $reserved,
                        'available_stock' => max($stock - $reserved, 0),
                        'last_updated_at' => now()->subMinutes(($product->id + $hub->id) * 7),
                    ],
                );
            }
        }
    }
}
