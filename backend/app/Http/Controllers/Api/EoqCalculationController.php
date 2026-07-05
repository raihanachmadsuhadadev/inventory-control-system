<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EoqCalculation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EoqCalculationController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Data perhitungan EOQ berhasil dimuat',
            'data' => EoqCalculation::query()
                ->with(['product:id,code,name,unit', 'calculator:id,name,email'])
                ->latest('calculated_at')
                ->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'annual_demand' => ['required', 'numeric', 'gt:0'],
            'ordering_cost' => ['required', 'numeric', 'gt:0'],
            'holding_cost' => ['required', 'numeric', 'gt:0'],
        ]);

        $eoqResult = (int) ceil(sqrt(
            (2 * (float) $data['annual_demand'] * (float) $data['ordering_cost'])
            / (float) $data['holding_cost'],
        ));

        $calculation = EoqCalculation::create([
            'product_id' => $data['product_id'],
            'annual_demand' => $data['annual_demand'],
            'ordering_cost' => $data['ordering_cost'],
            'holding_cost' => $data['holding_cost'],
            'eoq_result' => $eoqResult,
            'calculated_by' => $request->user()?->id,
            'calculated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Perhitungan EOQ berhasil disimpan',
            'data' => $calculation->load(['product:id,code,name,unit', 'calculator:id,name,email']),
        ], 201);
    }

    public function show(EoqCalculation $eoqCalculation): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Detail perhitungan EOQ berhasil dimuat',
            'data' => $eoqCalculation->load(['product:id,code,name,unit', 'calculator:id,name,email']),
        ]);
    }
}
