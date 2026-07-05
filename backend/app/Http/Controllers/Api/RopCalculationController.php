<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\RopCalculation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RopCalculationController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Data perhitungan ROP berhasil dimuat',
            'data' => RopCalculation::query()
                ->with(['product:id,code,name,minimum_stock,unit', 'hub:id,name,code', 'calculator:id,name,email'])
                ->latest('calculated_at')
                ->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'hub_id' => ['nullable', 'integer', 'exists:hubs,id'],
            'daily_demand' => ['required', 'numeric', 'gt:0'],
            'lead_time_days' => ['required', 'integer', 'min:0'],
            'safety_stock' => ['required', 'integer', 'min:0'],
        ]);

        $product = Product::query()->findOrFail($data['product_id']);
        $currentStock = 0;

        if (! empty($data['hub_id'])) {
            $currentStock = Inventory::query()
                ->where('product_id', $data['product_id'])
                ->where('hub_id', $data['hub_id'])
                ->value('current_stock') ?? 0;
        }

        $ropResult = ((float) $data['daily_demand'] * (int) $data['lead_time_days'])
            + (int) $data['safety_stock'];
        $stockStatus = $this->stockStatus($currentStock, $product->minimum_stock, $ropResult);

        $calculation = RopCalculation::create([
            'product_id' => $data['product_id'],
            'hub_id' => $data['hub_id'] ?? null,
            'daily_demand' => $data['daily_demand'],
            'lead_time_days' => $data['lead_time_days'],
            'safety_stock' => $data['safety_stock'],
            'current_stock' => $currentStock,
            'rop_result' => $ropResult,
            'stock_status' => $stockStatus,
            'calculated_by' => $request->user()?->id,
            'calculated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Perhitungan ROP berhasil disimpan',
            'data' => $calculation->load(['product:id,code,name,minimum_stock,unit', 'hub:id,name,code', 'calculator:id,name,email']),
        ], 201);
    }

    public function show(RopCalculation $ropCalculation): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Detail perhitungan ROP berhasil dimuat',
            'data' => $ropCalculation->load(['product:id,code,name,minimum_stock,unit', 'hub:id,name,code', 'calculator:id,name,email']),
        ]);
    }

    private function stockStatus(int $currentStock, int $minimumStock, float $ropResult): string
    {
        if ($currentStock <= $minimumStock) {
            return 'critical';
        }

        if ($currentStock <= $ropResult) {
            return 'reorder';
        }

        return 'safe';
    }
}
