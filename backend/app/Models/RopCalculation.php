<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'product_id',
    'hub_id',
    'daily_demand',
    'lead_time_days',
    'safety_stock',
    'current_stock',
    'rop_result',
    'stock_status',
    'calculated_by',
    'calculated_at',
])]
class RopCalculation extends Model
{
    use HasFactory;

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function hub(): BelongsTo
    {
        return $this->belongsTo(Hub::class);
    }

    public function calculator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'calculated_by');
    }

    protected function casts(): array
    {
        return [
            'product_id' => 'integer',
            'hub_id' => 'integer',
            'daily_demand' => 'decimal:2',
            'lead_time_days' => 'integer',
            'safety_stock' => 'integer',
            'current_stock' => 'integer',
            'rop_result' => 'decimal:2',
            'calculated_by' => 'integer',
            'calculated_at' => 'datetime',
        ];
    }
}
