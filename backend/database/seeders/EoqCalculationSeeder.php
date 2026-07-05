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
            ['code' => 'PRD-KOPI-001', 'annual_demand' => 1200, 'ordering_cost' => 50000, 'holding_cost' => 2000],
            ['code' => 'PRD-CUP-012', 'annual_demand' => 5000, 'ordering_cost' => 35000, 'holding_cost' => 500],
            ['code' => 'PRD-SUSU-001', 'annual_demand' => 1800, 'ordering_cost' => 40000, 'holding_cost' => 1500],
        ];

        foreach ($samples as $sample) {
            $product = Product::query()->where('code', $sample['code'])->first();

            if (! $product) {
                continue;
            }

            $eoqResult = (int) ceil(sqrt(
                (2 * $sample['annual_demand'] * $sample['ordering_cost']) / $sample['holding_cost'],
            ));

            EoqCalculation::firstOrCreate(
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
