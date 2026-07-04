<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hub;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class HubController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Data hub berhasil dimuat',
            'data' => Hub::query()->latest()->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $hub = Hub::create($this->validatedData($request));

        return response()->json([
            'success' => true,
            'message' => 'Hub berhasil dibuat',
            'data' => $hub,
        ], 201);
    }

    public function show(Hub $hub): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Detail hub berhasil dimuat',
            'data' => $hub,
        ]);
    }

    public function update(Request $request, Hub $hub): JsonResponse
    {
        $hub->update($this->validatedData($request, $hub->id));

        return response()->json([
            'success' => true,
            'message' => 'Hub berhasil diperbarui',
            'data' => $hub->refresh(),
        ]);
    }

    public function destroy(Hub $hub): JsonResponse
    {
        $hub->delete();

        return response()->json([
            'success' => true,
            'message' => 'Hub berhasil dihapus',
            'data' => null,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request, ?int $hubId = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('hubs', 'code')->ignore($hubId),
            ],
            'address' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
    }
}
