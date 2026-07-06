<?php

namespace Database\Seeders;

use App\Models\EoqCalculation;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class EoqCalculationSeeder extends Seeder
{
    /**
     * Seed sample EOQ calculations.
     */
    public function run(): void
    {
        $user = User::query()->where('email', 'superadmin@inventory.test')->first();
        $samples = [
            ['code' => 'PRD-KOPI-001', 'annual_demand' => 2400, 'ordering_cost' => 65000, 'holding_cost' => 2800],
            ['code' => 'PRD-KOPI-002', 'annual_demand' => 2100, 'ordering_cost' => 58000, 'holding_cost' => 2500],
            ['code' => 'PRD-GULA-001', 'annual_demand' => 1850, 'ordering_cost' => 42000, 'holding_cost' => 1800],
            ['code' => 'PRD-SYRUP-001', 'annual_demand' => 3200, 'ordering_cost' => 38000, 'holding_cost' => 1300],
            ['code' => 'PRD-CUP-012', 'annual_demand' => 18000, 'ordering_cost' => 35000, 'holding_cost' => 420],
            ['code' => 'PRD-CUP-016', 'annual_demand' => 15000, 'ordering_cost' => 36000, 'holding_cost' => 460],
            ['code' => 'PRD-LID-012', 'annual_demand' => 22000, 'ordering_cost' => 32000, 'holding_cost' => 360],
            ['code' => 'PRD-PAPERBAG-001', 'annual_demand' => 9200, 'ordering_cost' => 30000, 'holding_cost' => 520],
            ['code' => 'PRD-SUSU-001', 'annual_demand' => 3600, 'ordering_cost' => 47000, 'holding_cost' => 1900],
            ['code' => 'PRD-CREAMER-001', 'annual_demand' => 2800, 'ordering_cost' => 45000, 'holding_cost' => 1700],
            ['code' => 'PRD-MATCHA-001', 'annual_demand' => 1600, 'ordering_cost' => 52000, 'holding_cost' => 2300],
            ['code' => 'PRD-TEA-001', 'annual_demand' => 1200, 'ordering_cost' => 41000, 'holding_cost' => 2100],
            ['code' => 'PRD-FRZ-001', 'annual_demand' => 2600, 'ordering_cost' => 62000, 'holding_cost' => 2600],
            ['code' => 'PRD-FRZ-002', 'annual_demand' => 2300, 'ordering_cost' => 60000, 'holding_cost' => 2500],
            ['code' => 'PRD-CLEAN-001', 'annual_demand' => 720, 'ordering_cost' => 26000, 'holding_cost' => 1200],
            ['code' => 'PRD-CLEAN-002', 'annual_demand' => 880, 'ordering_cost' => 24000, 'holding_cost' => 1100],
            ['code' => 'PRD-EQUIP-001', 'annual_demand' => 4200, 'ordering_cost' => 28000, 'holding_cost' => 700],
            ['code' => 'PRD-SPR-001', 'annual_demand' => 240, 'ordering_cost' => 75000, 'holding_cost' => 4800],
        ];

        foreach ($samples as $sample) {
            $product = Product::query()->where('code', $sample['code'])->first();

            if (! $product) {
                continue;
            }

            $eoqResult = (int) ceil(sqrt(
                (2 * $sample['annual_demand'] * $sample['ordering_cost']) / $sample['holding_cost'],
            ));

            EoqCalculation::updateOrCreate(
                [
                    'product_id' => $product->id,
                    'annual_demand' => $sample['annual_demand'],
                    'ordering_cost' => $sample['ordering_cost'],
                    'holding_cost' => $sample['holding_cost'],
                ],
                [
                    'eoq_result' => $eoqResult,
                    'calculated_by' => $user?->id,
                    'calculated_at' => now(),
                ],
            );
        }
    }
}
