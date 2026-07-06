<?php

namespace Database\Seeders;

use App\Models\EoqCalculation;
use App\Models\Inventory;
use App\Models\PurchaseRecommendation;
use App\Models\RopCalculation;
use App\Models\User;
use Illuminate\Database\Seeder;

class PurchaseRecommendationSeeder extends Seeder
{
    /**
     * Seed sample purchase recommendations.
     */
    public function run(): void
    {
        $user = User::query()->where('email', 'superadmin@inventory.test')->first();
        $latestRops = RopCalculation::query()
            ->latest('calculated_at')
            ->get()
            ->unique(fn (RopCalculation $rop) => $rop->product_id.'|'.($rop->hub_id ?? 'none'));

        foreach ($latestRops->values() as $index => $rop) {
            $currentStock = $rop->hub_id
                ? Inventory::query()
                    ->where('product_id', $rop->product_id)
                    ->where('hub_id', $rop->hub_id)
                    ->value('current_stock') ?? 0
                : $rop->current_stock;
            $ropValue = (int) ceil((float) $rop->rop_result);

            if ($currentStock > $ropValue) {
                continue;
            }

            $eoq = EoqCalculation::query()
                ->where('product_id', $rop->product_id)
                ->latest('calculated_at')
                ->first();
            $status = $rop->stock_status === 'critical'
                ? 'pending'
                : match ($index % 4) {
                    0 => 'approved',
                    1 => 'rejected',
                    default => 'pending',
                };
            $verified = $status !== 'pending';

            PurchaseRecommendation::updateOrCreate(
                [
                    'product_id' => $rop->product_id,
                    'hub_id' => $rop->hub_id,
                    'status' => $status,
                ],
                [
                    'eoq_calculation_id' => $eoq?->id,
                    'rop_calculation_id' => $rop->id,
                    'current_stock' => $currentStock,
                    'rop_value' => $ropValue,
                    'recommended_quantity' => $eoq
                        ? $eoq->eoq_result
                        : max($ropValue - $currentStock, 1),
                    'notes' => $rop->stock_status === 'critical'
                        ? 'Prioritas tinggi: stok berada pada level kritis.'
                        : 'Rekomendasi berdasarkan ROP terbaru dan kuantitas EOQ.',
                    'verified_by' => $verified ? $user?->id : null,
                    'verified_at' => $verified ? now()->subHours($index + 2) : null,
                    'created_by' => $user?->id,
                ],
            );
        }
    }
}
