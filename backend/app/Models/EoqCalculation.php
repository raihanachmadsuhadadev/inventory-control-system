<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'product_id',
    'annual_demand',
    'ordering_cost',
    'holding_cost',
    'eoq_result',
    'calculated_by',
    'calculated_at',
])]
class EoqCalculation extends Model
{
    use HasFactory;

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function calculator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'calculated_by');
    }

    protected function casts(): array
    {
        return [
            'product_id' => 'integer',
            'annual_demand' => 'decimal:2',
            'ordering_cost' => 'decimal:2',
            'holding_cost' => 'decimal:2',
            'eoq_result' => 'integer',
            'calculated_by' => 'integer',
            'calculated_at' => 'datetime',
        ];
    }
}
