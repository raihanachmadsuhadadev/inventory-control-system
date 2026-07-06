<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    /**
     * Seed initial suppliers.
     */
    public function run(): void
    {
        $suppliers = [
            ['code' => 'SUP-AGRO', 'name' => 'Nusa Agro', 'contact_person' => 'Budi Santoso', 'phone' => '081234567001', 'email' => 'sales@nusaagro.test', 'address' => 'Jl. Pangan Nusantara No. 10, Bogor', 'lead_time_days' => 5, 'description' => 'Supplier bahan baku utama.'],
            ['code' => 'SUP-PACK', 'name' => 'Prima Pack', 'contact_person' => 'Rina Putri', 'phone' => '081234567002', 'email' => 'order@primapack.test', 'address' => 'Jl. Kemasan Industri No. 22, Tangerang', 'lead_time_days' => 3, 'description' => 'Supplier kemasan dan perlengkapan packing.'],
            ['code' => 'SUP-DAIRY', 'name' => 'Dairy Fresh', 'contact_person' => 'Agus Wijaya', 'phone' => '081234567003', 'email' => 'hello@dairyfresh.test', 'address' => 'Jl. Susu Segar No. 7, Bandung', 'lead_time_days' => 4, 'description' => 'Supplier produk dairy.'],
            ['code' => 'SUP-TEA', 'name' => 'Bumi Teh Lestari', 'contact_person' => 'Maya Lestari', 'phone' => '081234567004', 'email' => 'sales@bumiteh.test', 'address' => 'Jl. Perkebunan Teh No. 14, Sukabumi', 'lead_time_days' => 6, 'description' => 'Supplier teh, matcha, dan bahan minuman.'],
            ['code' => 'SUP-FROZEN', 'name' => 'Arctic Food Supply', 'contact_person' => 'Hendra Lim', 'phone' => '081234567005', 'email' => 'cs@arcticfood.test', 'address' => 'Kawasan Cold Chain Blok C3, Bekasi', 'lead_time_days' => 7, 'description' => 'Supplier frozen food dan produk beku.'],
            ['code' => 'SUP-CLEAN', 'name' => 'Higienis Makmur', 'contact_person' => 'Sari Wulandari', 'phone' => '081234567006', 'email' => 'order@higienis.test', 'address' => 'Jl. Kebersihan No. 19, Depok', 'lead_time_days' => 2, 'description' => 'Supplier cleaning supply dan sanitasi.'],
            ['code' => 'SUP-EQUIP', 'name' => 'Tekno Gudang Prima', 'contact_person' => 'Rangga Pratama', 'phone' => '081234567007', 'email' => 'support@teknogudang.test', 'address' => 'Jl. Mekanik Industri No. 31, Cikarang', 'lead_time_days' => 8, 'description' => 'Supplier peralatan dan sparepart gudang.'],
            ['code' => 'SUP-SUGAR', 'name' => 'Manis Sentosa', 'contact_person' => 'Dewi Kartika', 'phone' => '081234567008', 'email' => 'sales@manissentosa.test', 'address' => 'Jl. Gula Raya No. 6, Cirebon', 'lead_time_days' => 4, 'description' => 'Supplier gula, syrup, dan pemanis.'],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::updateOrCreate(
                ['code' => $supplier['code']],
                $supplier + ['is_active' => true],
            );
        }
    }
}
