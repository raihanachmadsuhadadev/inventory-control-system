<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Seed initial products.
     */
    public function run(): void
    {
        $categories = Category::query()->pluck('id', 'code');
        $suppliers = Supplier::query()->pluck('id', 'code');

        $products = [
            ['category_id' => $categories['BB'] ?? null, 'supplier_id' => $suppliers['SUP-AGRO'] ?? null, 'code' => 'PRD-KOPI-001', 'name' => 'Kopi Arabica 1kg', 'unit' => 'kg', 'minimum_stock' => 20, 'description' => 'Biji kopi arabica kemasan 1kg.'],
            ['category_id' => $categories['BB'] ?? null, 'supplier_id' => $suppliers['SUP-AGRO'] ?? null, 'code' => 'PRD-KOPI-002', 'name' => 'Kopi Robusta 1kg', 'unit' => 'kg', 'minimum_stock' => 24, 'description' => 'Biji kopi robusta untuk blend harian.'],
            ['category_id' => $categories['BB'] ?? null, 'supplier_id' => $suppliers['SUP-SUGAR'] ?? null, 'code' => 'PRD-GULA-001', 'name' => 'Gula Aren Cair 5L', 'unit' => 'liter', 'minimum_stock' => 18, 'description' => 'Gula aren cair untuk minuman signature.'],
            ['category_id' => $categories['BB'] ?? null, 'supplier_id' => $suppliers['SUP-SUGAR'] ?? null, 'code' => 'PRD-SYRUP-001', 'name' => 'Syrup Vanilla 1L', 'unit' => 'botol', 'minimum_stock' => 30, 'description' => 'Syrup vanilla untuk beverage.'],
            ['category_id' => $categories['KMS'] ?? null, 'supplier_id' => $suppliers['SUP-PACK'] ?? null, 'code' => 'PRD-CUP-012', 'name' => 'Cup Paper 12oz', 'unit' => 'pcs', 'minimum_stock' => 120, 'description' => 'Cup paper ukuran 12oz.'],
            ['category_id' => $categories['KMS'] ?? null, 'supplier_id' => $suppliers['SUP-PACK'] ?? null, 'code' => 'PRD-CUP-016', 'name' => 'Cup Paper 16oz', 'unit' => 'pcs', 'minimum_stock' => 100, 'description' => 'Cup paper ukuran 16oz.'],
            ['category_id' => $categories['KMS'] ?? null, 'supplier_id' => $suppliers['SUP-PACK'] ?? null, 'code' => 'PRD-LID-012', 'name' => 'Lid Cup 12/16oz', 'unit' => 'pcs', 'minimum_stock' => 150, 'description' => 'Tutup cup untuk minuman dingin dan panas.'],
            ['category_id' => $categories['KMS'] ?? null, 'supplier_id' => $suppliers['SUP-PACK'] ?? null, 'code' => 'PRD-PAPERBAG-001', 'name' => 'Paper Bag Medium', 'unit' => 'pcs', 'minimum_stock' => 80, 'description' => 'Paper bag ukuran medium untuk takeaway.'],
            ['category_id' => $categories['MNM'] ?? null, 'supplier_id' => $suppliers['SUP-DAIRY'] ?? null, 'code' => 'PRD-SUSU-001', 'name' => 'Susu UHT 1L', 'unit' => 'liter', 'minimum_stock' => 25, 'description' => 'Susu UHT kemasan 1 liter.'],
            ['category_id' => $categories['MNM'] ?? null, 'supplier_id' => $suppliers['SUP-DAIRY'] ?? null, 'code' => 'PRD-CREAMER-001', 'name' => 'Creamer Dairy 1L', 'unit' => 'liter', 'minimum_stock' => 22, 'description' => 'Creamer dairy untuk minuman kopi.'],
            ['category_id' => $categories['MNM'] ?? null, 'supplier_id' => $suppliers['SUP-TEA'] ?? null, 'code' => 'PRD-MATCHA-001', 'name' => 'Matcha Powder 500g', 'unit' => 'pack', 'minimum_stock' => 16, 'description' => 'Matcha powder premium.'],
            ['category_id' => $categories['MNM'] ?? null, 'supplier_id' => $suppliers['SUP-TEA'] ?? null, 'code' => 'PRD-TEA-001', 'name' => 'Black Tea Leaves 1kg', 'unit' => 'kg', 'minimum_stock' => 14, 'description' => 'Daun teh hitam untuk brewed tea.'],
            ['category_id' => $categories['FRZ'] ?? null, 'supplier_id' => $suppliers['SUP-FROZEN'] ?? null, 'code' => 'PRD-FRZ-001', 'name' => 'French Fries 2.5kg', 'unit' => 'pack', 'minimum_stock' => 20, 'description' => 'Frozen french fries untuk outlet.'],
            ['category_id' => $categories['FRZ'] ?? null, 'supplier_id' => $suppliers['SUP-FROZEN'] ?? null, 'code' => 'PRD-FRZ-002', 'name' => 'Chicken Nugget 1kg', 'unit' => 'pack', 'minimum_stock' => 18, 'description' => 'Frozen chicken nugget.'],
            ['category_id' => $categories['CLN'] ?? null, 'supplier_id' => $suppliers['SUP-CLEAN'] ?? null, 'code' => 'PRD-CLEAN-001', 'name' => 'Food Grade Sanitizer 5L', 'unit' => 'jerigen', 'minimum_stock' => 10, 'description' => 'Sanitizer food grade untuk area produksi.'],
            ['category_id' => $categories['CLN'] ?? null, 'supplier_id' => $suppliers['SUP-CLEAN'] ?? null, 'code' => 'PRD-CLEAN-002', 'name' => 'Hand Soap Refill 5L', 'unit' => 'jerigen', 'minimum_stock' => 12, 'description' => 'Sabun tangan refill untuk gudang dan outlet.'],
            ['category_id' => $categories['PRL'] ?? null, 'supplier_id' => $suppliers['SUP-EQUIP'] ?? null, 'code' => 'PRD-EQUIP-001', 'name' => 'Thermal Label Roll', 'unit' => 'roll', 'minimum_stock' => 35, 'description' => 'Label thermal untuk barcode stok.'],
            ['category_id' => $categories['SPR'] ?? null, 'supplier_id' => $suppliers['SUP-EQUIP'] ?? null, 'code' => 'PRD-SPR-001', 'name' => 'Forklift Battery Connector', 'unit' => 'pcs', 'minimum_stock' => 6, 'description' => 'Sparepart konektor baterai forklift.'],
        ];

        foreach ($products as $product) {
            if (! $product['category_id']) {
                continue;
            }

            Product::updateOrCreate(
                ['code' => $product['code']],
                $product + ['is_active' => true],
            );
        }
    }
}
