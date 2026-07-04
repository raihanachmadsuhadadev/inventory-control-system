<?php

namespace Database\Seeders;

use App\Models\Shift;
use Illuminate\Database\Seeder;

class ShiftSeeder extends Seeder
{
    /**
     * Seed initial shifts.
     */
    public function run(): void
    {
        $shifts = [
            [
                'name' => 'Shift Pagi',
                'code' => 'PAGI',
                'start_time' => '07:00',
                'end_time' => '15:00',
                'description' => 'Operasional gudang pagi.',
            ],
            [
                'name' => 'Shift Siang',
                'code' => 'SIANG',
                'start_time' => '15:00',
                'end_time' => '23:00',
                'description' => 'Operasional gudang siang hingga malam.',
            ],
            [
                'name' => 'Shift Malam',
                'code' => 'MALAM',
                'start_time' => '23:00',
                'end_time' => '07:00',
                'description' => 'Operasional gudang malam.',
            ],
        ];

        foreach ($shifts as $shift) {
            Shift::updateOrCreate(
                ['code' => $shift['code']],
                $shift + ['is_active' => true],
            );
        }
    }
}
