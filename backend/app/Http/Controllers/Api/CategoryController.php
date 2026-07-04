<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Data kategori berhasil dimuat',
            'data' => Category::query()->latest()->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $category = Category::create($this->validatedData($request));

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil dibuat',
            'data' => $category,
        ], 201);
    }

    public function show(Category $category): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Detail kategori berhasil dimuat',
            'data' => $category,
        ]);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $category->update($this->validatedData($request, $category->id));

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil diperbarui',
            'data' => $category->refresh(),
        ]);
    }

    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil dihapus',
            'data' => null,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request, ?int $categoryId = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('categories', 'code')->ignore($categoryId),
            ],
            'description' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
    }
}
