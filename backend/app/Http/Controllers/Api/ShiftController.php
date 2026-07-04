<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shift;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ShiftController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Data shift berhasil dimuat',
            'data' => Shift::query()->latest()->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $shift = Shift::create($this->validatedData($request));

        return response()->json([
            'success' => true,
            'message' => 'Shift berhasil dibuat',
            'data' => $shift,
        ], 201);
    }

    public function show(Shift $shift): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Detail shift berhasil dimuat',
            'data' => $shift,
        ]);
    }

    public function update(Request $request, Shift $shift): JsonResponse
    {
        $shift->update($this->validatedData($request, $shift->id));

        return response()->json([
            'success' => true,
            'message' => 'Shift berhasil diperbarui',
            'data' => $shift->refresh(),
        ]);
    }

    public function destroy(Shift $shift): JsonResponse
    {
        $shift->delete();

        return response()->json([
            'success' => true,
            'message' => 'Shift berhasil dihapus',
            'data' => null,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request, ?int $shiftId = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('shifts', 'code')->ignore($shiftId),
            ],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
            'description' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
    }
}
