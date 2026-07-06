<?php

namespace Database\Seeders;

use App\Models\Inventory;
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
        $user = User::query()->where('email', 'superadmin@inventory.test')->first();
        $inventories = Inventory::query()
            ->with(['product.supplier', 'hub'])
            ->whereHas('product')
            ->whereHas('hub')
            ->get();

        if ($inventories->isEmpty()) {
            return;
        }

        $dailyDemand = [
            'PRD-KOPI-001' => 11,
            'PRD-KOPI-002' => 9,
            'PRD-GULA-001' => 8,
            'PRD-SYRUP-001' => 12,
            'PRD-CUP-012' => 42,
            'PRD-CUP-016' => 36,
            'PRD-LID-012' => 48,
            'PRD-PAPERBAG-001' => 21,
            'PRD-SUSU-001' => 13,
            'PRD-CREAMER-001' => 10,
            'PRD-MATCHA-001' => 6,
            'PRD-TEA-001' => 5,
            'PRD-FRZ-001' => 8,
            'PRD-FRZ-002' => 7,
            'PRD-CLEAN-001' => 3,
            'PRD-CLEAN-002' => 4,
            'PRD-EQUIP-001' => 11,
            'PRD-SPR-001' => 1,
        ];

        foreach ($inventories as $inventory) {
            $product = $inventory->product;
            $demand = $dailyDemand[$product->code] ?? max((int) ceil($product->minimum_stock / 3), 1);
            $leadTime = $product->supplier?->lead_time_days ?? 4;
            $safetyStock = max((int) ceil($product->minimum_stock * 0.6), 4);
            $ropResult = ($demand * $leadTime) + $safetyStock;
            $stockStatus = $inventory->current_stock <= $product->minimum_stock
                ? 'critical'
                : ($inventory->current_stock <= $ropResult ? 'reorder' : 'safe');

            RopCalculation::updateOrCreate(
                [
                    'product_id' => $inventory->product_id,
                    'hub_id' => $inventory->hub_id,
                    'daily_demand' => $demand,
                    'lead_time_days' => $leadTime,
                    'safety_stock' => $safetyStock,
                ],
                [
                    'current_stock' => $inventory->current_stock,
                    'rop_result' => $ropResult,
                    'stock_status' => $stockStatus,
                    'calculated_by' => $user?->id,
                    'calculated_at' => now(),
                ],
            );
        }
    }
}
