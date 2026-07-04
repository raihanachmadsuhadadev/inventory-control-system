<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Seed initial categories.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Bahan Baku',
                'code' => 'BB',
                'description' => 'Material utama untuk operasional dan produksi.',
            ],
            [
                'name' => 'Kemasan',
                'code' => 'KMS',
                'description' => 'Barang pendukung untuk pengemasan produk.',
            ],
            [
                'name' => 'Peralatan',
                'code' => 'PRL',
                'description' => 'Peralatan operasional gudang dan outlet.',
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['code' => $category['code']],
                $category + ['is_active' => true],
            );
        }
    }
}
