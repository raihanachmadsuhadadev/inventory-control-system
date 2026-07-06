<?php

namespace Database\Seeders;

use App\Models\Inventory;
use App\Models\StockTransaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class StockTransactionSeeder extends Seeder
{
    /**
     * Seed initial stock transactions.
     */
    public function run(): void
    {
        $user = User::query()->where('email', 'superadmin@inventory.test')->first();
        $inventories = Inventory::query()
            ->with(['product', 'hub'])
            ->whereHas('product')
            ->whereHas('hub')
            ->get();

        if ($inventories->isEmpty()) {
            return;
        }

        foreach ($inventories as $inventory) {
            $initialIn = $inventory->current_stock + max((int) ceil($inventory->current_stock * 0.32), 6);
            $outQuantity = max((int) ceil($inventory->current_stock * 0.18), 2);
            $stockAfterOut = max($initialIn - $outQuantity, 0);

            $rows = [
                [
                    'type' => 'in',
                    'quantity' => $initialIn,
                    'stock_before' => 0,
                    'stock_after' => $initialIn,
                    'notes' => 'Stok awal '.$inventory->product->name.' di '.$inventory->hub->name,
                ],
                [
                    'type' => 'out',
                    'quantity' => $outQuantity,
                    'stock_before' => $initialIn,
                    'stock_after' => $stockAfterOut,
                    'notes' => 'Distribusi rutin '.$inventory->product->name.' dari '.$inventory->hub->name,
                ],
                [
                    'type' => 'adjustment',
                    'quantity' => $inventory->current_stock,
                    'stock_before' => $stockAfterOut,
                    'stock_after' => $inventory->current_stock,
                    'notes' => 'Penyesuaian hasil stock opname '.$inventory->product->name.' di '.$inventory->hub->name,
                ],
            ];

            foreach ($rows as $row) {
                StockTransaction::updateOrCreate(
                    [
                        'product_id' => $inventory->product_id,
                        'hub_id' => $inventory->hub_id,
                        'type' => $row['type'],
                        'notes' => $row['notes'],
                    ],
                    [
                        'quantity' => $row['quantity'],
                        'stock_before' => $row['stock_before'],
                        'stock_after' => $row['stock_after'],
                        'created_by' => $user?->id,
                    ],
                );
            }
        }
    }
}
