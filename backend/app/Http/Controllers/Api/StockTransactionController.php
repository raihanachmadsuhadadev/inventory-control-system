<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StockTransaction;
use App\Services\StockTransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class StockTransactionController extends Controller
{
    public function __construct(private readonly StockTransactionService $stockTransactionService)
    {
    }

    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Data transaksi stok berhasil dimuat',
            'data' => StockTransaction::query()
                ->with([
                    'product:id,code,name,unit',
                    'hub:id,name,code',
                    'creator:id,name,email',
                ])
                ->latest()
                ->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'hub_id' => ['required', 'integer', 'exists:hubs,id'],
            'type' => ['required', 'string', Rule::in(['in', 'out', 'adjustment'])],
            'quantity' => ['required', 'integer', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        if (in_array($data['type'], ['in', 'out'], true) && $data['quantity'] < 1) {
            throw ValidationException::withMessages([
                'quantity' => 'Quantity untuk transaksi masuk dan keluar minimal 1.',
            ]);
        }

        $transaction = $this->stockTransactionService->create($data, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Transaksi stok berhasil disimpan',
            'data' => $transaction->load([
                'product:id,code,name,unit',
                'hub:id,name,code',
                'creator:id,name,email',
            ]),
        ], 201);
    }

    public function show(StockTransaction $stockTransaction): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Detail transaksi stok berhasil dimuat',
            'data' => $stockTransaction->load([
                'product:id,code,name,unit',
                'hub:id,name,code',
                'creator:id,name,email',
            ]),
        ]);
    }
}
