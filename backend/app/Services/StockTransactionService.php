<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\StockTransaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockTransactionService
{
    /**
     * @param array{product_id:int,hub_id:int,type:string,quantity:int,notes?:string|null} $data
     */
    public function create(array $data, ?User $user = null): StockTransaction
    {
        return DB::transaction(function () use ($data, $user): StockTransaction {
            $inventory = Inventory::query()
                ->where('product_id', $data['product_id'])
                ->where('hub_id', $data['hub_id'])
                ->lockForUpdate()
                ->first();

            if (! $inventory && $data['type'] === 'out') {
                throw ValidationException::withMessages([
                    'product_id' => 'Inventory untuk produk dan hub ini belum tersedia.',
                ]);
            }

            if (! $inventory) {
                $inventory = Inventory::create([
                    'product_id' => $data['product_id'],
                    'hub_id' => $data['hub_id'],
                    'current_stock' => 0,
                    'reserved_stock' => 0,
                    'available_stock' => 0,
                ]);
            }

            $stockBefore = $inventory->current_stock;
            $stockAfter = match ($data['type']) {
                'in' => $stockBefore + $data['quantity'],
                'out' => $stockBefore - $data['quantity'],
                'adjustment' => $data['quantity'],
            };

            if ($stockAfter < 0) {
                throw ValidationException::withMessages([
                    'quantity' => 'Stok tidak mencukupi untuk transaksi keluar.',
                ]);
            }

            $inventory->update([
                'current_stock' => $stockAfter,
                'available_stock' => $stockAfter - $inventory->reserved_stock,
                'last_updated_at' => now(),
            ]);

            return StockTransaction::create([
                'product_id' => $data['product_id'],
                'hub_id' => $data['hub_id'],
                'type' => $data['type'],
                'quantity' => $data['quantity'],
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'notes' => $data['notes'] ?? null,
                'created_by' => $user?->id,
            ]);
        });
    }
}
