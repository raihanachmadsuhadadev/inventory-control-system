<?php

namespace Database\Seeders;

use App\Models\Hub;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\RopCalculation;
use App\Models\User;
use Illuminate\Database\Seeder;

class RopCalculationSeeder extends Seeder
{
    /**
     * Seed sample ROP calculations.
     */
    public function run(): void
    {
        $hub = Hub::query()->where('code', 'HUB-PST')->first();
        $user = User::query()->where('email', 'superadmin@inventory.test')->first();

        if (! $hub) {
            return;
        }

        $samples = [
            ['code' => 'PRD-KOPI-001', 'daily_demand' => 10, 'lead_time_days' => 5, 'safety_stock' => 20],
            ['code' => 'PRD-CUP-012', 'daily_demand' => 35, 'lead_time_days' => 3, 'safety_stock' => 40],
            ['code' => 'PRD-SUSU-001', 'daily_demand' => 8, 'lead_time_days' => 4, 'safety_stock' => 12],
        ];

        foreach ($samples as $sample) {
            $product = Product::query()->where('code', $sample['code'])->first();

            if (! $product) {
                continue;
            }

            $currentStock = Inventory::query()
                ->where('product_id', $product->id)
                ->where('hub_id', $hub->id)
                ->value('current_stock') ?? 0;
            $ropResult = ($sample['daily_demand'] * $sample['lead_time_days']) + $sample['safety_stock'];
            $stockStatus = $currentStock <= $product->minimum_stock
                ? 'critical'
                : ($currentStock <= $ropResult ? 'reorder' : 'safe');

            RopCalculation::firstOrCreate(
                [
                    'product_id' => $product->id,
                    'hub_id' => $hub->id,
                    'daily_demand' => $sample['daily_demand'],
                    'lead_time_days' => $sample['lead_time_days'],
                    'safety_stock' => $sample['safety_stock'],
                ],
                [
                    'current_stock' => $currentStock,
                    'rop_result' => $ropResult,
                    'stock_status' => $stockStatus,
                    'calculated_by' => $user?->id,
                    'calculated_at' => now(),
                ],
            );
        }
    }
}
