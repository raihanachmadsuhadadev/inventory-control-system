<?php

namespace App\Http\Controllers\Api\ImportExport;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Hub;
use App\Models\Product;
use App\Models\Role;
use App\Models\Shift;
use App\Models\Supplier;
use App\Models\User;
use App\Services\StockTransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Throwable;

class ImportExportController extends Controller
{
    public function __construct(private readonly StockTransactionService $stockTransactionService)
    {
    }

    public function template(string $type)
    {
        $config = $this->config($type);
        $filename = str_replace('.xlsx', '.csv', $config['filename']);

        return response()->streamDownload(function () use ($config): void {
            $output = fopen('php://output', 'w');
            fputcsv($output, $config['headers']);

            foreach ($config['examples'] as $example) {
                fputcsv($output, $example);
            }

            fclose($output);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }

    public function import(Request $request, string $type): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:5120'],
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());

        if ($extension === 'xlsx') {
            return response()->json([
                'success' => false,
                'message' => 'Import XLSX membutuhkan Laravel Excel. Gunakan template CSV fallback dari sistem ini.',
                'data' => $this->emptySummary(),
            ], 422);
        }

        if (! in_array($extension, ['csv', 'txt'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Format file tidak valid. Gunakan CSV.',
                'data' => $this->emptySummary(),
            ], 422);
        }

        $config = $this->config($type);
        $rows = $this->readCsv($file->getRealPath());
        $summary = $this->emptySummary();

        if (! $rows) {
            $summary['errors'][] = ['row' => 1, 'message' => 'File kosong atau header tidak valid'];

            return response()->json([
                'success' => false,
                'message' => 'Import selesai dengan beberapa error',
                'data' => $summary,
            ], 422);
        }

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2;

            try {
                $result = match ($type) {
                    'users' => $this->importUser($row),
                    'hubs' => $this->importHub($row),
                    'categories' => $this->importCategory($row),
                    'shifts' => $this->importShift($row),
                    'suppliers' => $this->importSupplier($row),
                    'products' => $this->importProduct($row),
                    'stock-transactions' => $this->importStockTransaction($row, $request),
                    default => throw new \InvalidArgumentException('Tipe import tidak didukung.'),
                };

                $summary[$result]++;
            } catch (Throwable $exception) {
                $summary['skipped']++;
                $summary['errors'][] = [
                    'row' => $rowNumber,
                    'message' => $exception->getMessage(),
                ];
            }
        }

        $hasErrors = count($summary['errors']) > 0;

        return response()->json([
            'success' => ! $hasErrors,
            'message' => $hasErrors ? 'Import selesai dengan beberapa error' : 'Import selesai',
            'data' => $summary,
        ]);
    }

    private function config(string $type): array
    {
        return match ($type) {
            'users' => [
                'filename' => 'template-users.xlsx',
                'headers' => ['name', 'email', 'password', 'role_slug', 'hub_code', 'shift_code', 'is_active'],
                'examples' => [
                    ['Admin Baru', 'adminbaru@inventory.test', 'password', 'admin_gudang', 'HUB-PST', 'PAGI', '1'],
                ],
            ],
            'hubs' => [
                'filename' => 'template-hubs.xlsx',
                'headers' => ['code', 'name', 'address', 'description', 'is_active'],
                'examples' => [
                    ['HUB-CRB', 'Gudang Cirebon', 'Cirebon', 'Gudang utama Cirebon', '1'],
                ],
            ],
            'categories' => [
                'filename' => 'template-categories.xlsx',
                'headers' => ['code', 'name', 'description', 'is_active'],
                'examples' => [
                    ['CAT-COS', 'Cosmetic', 'Produk kosmetik', '1'],
                ],
            ],
            'shifts' => [
                'filename' => 'template-shifts.xlsx',
                'headers' => ['code', 'name', 'start_time', 'end_time', 'description', 'is_active'],
                'examples' => [
                    ['SORE', 'Shift Sore', '13:00', '21:00', 'Operasional sore', '1'],
                ],
            ],
            'suppliers' => [
                'filename' => 'template-suppliers.xlsx',
                'headers' => ['code', 'name', 'contact_person', 'phone', 'email', 'address', 'lead_time_days', 'description', 'is_active'],
                'examples' => [
                    ['SUP-001', 'Supplier Utama', 'Budi', '08123456789', 'supplier@example.com', 'Jakarta', '5', 'Supplier reguler', '1'],
                ],
            ],
            'products' => [
                'filename' => 'template-products.xlsx',
                'headers' => ['code', 'name', 'category_code', 'supplier_code', 'unit', 'minimum_stock', 'description', 'is_active'],
                'examples' => [
                    ['PRD-001', 'Shampoo Softly 100ml', 'CAT-COS', 'SUP-001', 'pcs', '20', 'Produk shampoo kemasan kecil', '1'],
                ],
            ],
            'stock-transactions' => [
                'filename' => 'template-stock-transactions.xlsx',
                'headers' => ['product_code', 'hub_code', 'type', 'quantity', 'notes'],
                'examples' => [
                    ['PRD-KOPI-001', 'HUB-PST', 'in', '10', 'Stok masuk dari import'],
                ],
            ],
            default => abort(404),
        };
    }

    private function readCsv(string $path): array
    {
        $handle = fopen($path, 'r');
        $headers = fgetcsv($handle);
        $rows = [];

        if (! $headers) {
            return [];
        }

        $headers = array_map(fn ($header) => trim(strtolower($header)), $headers);

        while (($data = fgetcsv($handle)) !== false) {
            if (count(array_filter($data, fn ($value) => trim((string) $value) !== '')) === 0) {
                continue;
            }

            $rows[] = array_combine(
                $headers,
                array_slice(array_pad($data, count($headers), null), 0, count($headers)),
            );
        }

        fclose($handle);

        return $rows;
    }

    private function importUser(array $row): string
    {
        $validator = Validator::make($row, [
            'name' => ['required', 'string'],
            'email' => ['required', 'email'],
            'role_slug' => ['required', Rule::exists('roles', 'slug')],
            'password' => ['nullable', 'string'],
            'is_active' => ['nullable'],
        ]);
        $this->throwIfInvalid($validator);

        $role = Role::where('slug', $row['role_slug'])->firstOrFail();
        $existing = User::where('email', $row['email'])->first();

        if (! $existing && empty($row['password'])) {
            throw new \RuntimeException('password wajib untuk user baru');
        }

        User::updateOrCreate(
            ['email' => $row['email']],
            [
                'name' => $row['name'],
                'role_id' => $role->id,
                'password' => ! empty($row['password'])
                    ? Hash::make($row['password'])
                    : $existing->password,
                'is_active' => $this->boolValue($row['is_active'] ?? true),
            ],
        );

        return $existing ? 'updated' : 'created';
    }

    private function importHub(array $row): string
    {
        $this->throwIfInvalid(Validator::make($row, [
            'code' => ['required', 'string'],
            'name' => ['required', 'string'],
            'is_active' => ['nullable'],
        ]));
        $existing = Hub::where('code', $row['code'])->exists();
        Hub::updateOrCreate(['code' => $row['code']], [
            'name' => $row['name'],
            'address' => $row['address'] ?? null,
            'description' => $row['description'] ?? null,
            'is_active' => $this->boolValue($row['is_active'] ?? true),
        ]);

        return $existing ? 'updated' : 'created';
    }

    private function importCategory(array $row): string
    {
        $this->throwIfInvalid(Validator::make($row, [
            'code' => ['required', 'string'],
            'name' => ['required', 'string'],
            'is_active' => ['nullable'],
        ]));
        $existing = Category::where('code', $row['code'])->exists();
        Category::updateOrCreate(['code' => $row['code']], [
            'name' => $row['name'],
            'description' => $row['description'] ?? null,
            'is_active' => $this->boolValue($row['is_active'] ?? true),
        ]);

        return $existing ? 'updated' : 'created';
    }

    private function importShift(array $row): string
    {
        $this->throwIfInvalid(Validator::make($row, [
            'code' => ['required', 'string'],
            'name' => ['required', 'string'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
            'is_active' => ['nullable'],
        ]));
        $existing = Shift::where('code', $row['code'])->exists();
        Shift::updateOrCreate(['code' => $row['code']], [
            'name' => $row['name'],
            'start_time' => $row['start_time'] ?: null,
            'end_time' => $row['end_time'] ?: null,
            'description' => $row['description'] ?? null,
            'is_active' => $this->boolValue($row['is_active'] ?? true),
        ]);

        return $existing ? 'updated' : 'created';
    }

    private function importSupplier(array $row): string
    {
        $this->throwIfInvalid(Validator::make($row, [
            'code' => ['required', 'string'],
            'name' => ['required', 'string'],
            'email' => ['nullable', 'email'],
            'lead_time_days' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable'],
        ]));
        $existing = Supplier::where('code', $row['code'])->exists();
        Supplier::updateOrCreate(['code' => $row['code']], [
            'name' => $row['name'],
            'contact_person' => $row['contact_person'] ?? null,
            'phone' => $row['phone'] ?? null,
            'email' => $row['email'] ?? null,
            'address' => $row['address'] ?? null,
            'lead_time_days' => $row['lead_time_days'] !== '' ? $row['lead_time_days'] : null,
            'description' => $row['description'] ?? null,
            'is_active' => $this->boolValue($row['is_active'] ?? true),
        ]);

        return $existing ? 'updated' : 'created';
    }

    private function importProduct(array $row): string
    {
        $this->throwIfInvalid(Validator::make($row, [
            'code' => ['required', 'string'],
            'name' => ['required', 'string'],
            'category_code' => ['required', 'string'],
            'supplier_code' => ['nullable', 'string'],
            'unit' => ['required', 'string'],
            'minimum_stock' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable'],
        ]));
        $category = Category::where('code', $row['category_code'])->first();
        $supplier = ! empty($row['supplier_code'])
            ? Supplier::where('code', $row['supplier_code'])->first()
            : null;

        if (! $category) {
            throw new \RuntimeException('category_code tidak ditemukan');
        }

        if (! empty($row['supplier_code']) && ! $supplier) {
            throw new \RuntimeException('supplier_code tidak ditemukan');
        }

        $existing = Product::where('code', $row['code'])->exists();
        Product::updateOrCreate(['code' => $row['code']], [
            'name' => $row['name'],
            'category_id' => $category->id,
            'supplier_id' => $supplier?->id,
            'unit' => $row['unit'],
            'minimum_stock' => $row['minimum_stock'] !== '' ? $row['minimum_stock'] : 0,
            'description' => $row['description'] ?? null,
            'is_active' => $this->boolValue($row['is_active'] ?? true),
        ]);

        return $existing ? 'updated' : 'created';
    }

    private function importStockTransaction(array $row, Request $request): string
    {
        $this->throwIfInvalid(Validator::make($row, [
            'product_code' => ['required', 'string'],
            'hub_code' => ['required', 'string'],
            'type' => ['required', Rule::in(['in', 'out', 'adjustment'])],
            'quantity' => ['required', 'integer', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]));
        $product = Product::where('code', $row['product_code'])->first();
        $hub = Hub::where('code', $row['hub_code'])->first();

        if (! $product) {
            throw new \RuntimeException('product_code tidak ditemukan');
        }

        if (! $hub) {
            throw new \RuntimeException('hub_code tidak ditemukan');
        }

        $quantity = (int) $row['quantity'];

        if (in_array($row['type'], ['in', 'out'], true) && $quantity < 1) {
            throw new \RuntimeException('quantity untuk in/out minimal 1');
        }

        $this->stockTransactionService->create([
            'product_id' => $product->id,
            'hub_id' => $hub->id,
            'type' => $row['type'],
            'quantity' => $quantity,
            'notes' => $row['notes'] ?? null,
        ], $request->user());

        return 'created';
    }

    private function throwIfInvalid($validator): void
    {
        if ($validator->fails()) {
            throw new \RuntimeException($validator->errors()->first());
        }
    }

    private function boolValue(mixed $value): bool
    {
        return in_array(strtolower((string) $value), ['1', 'true', 'yes', 'aktif'], true);
    }

    private function emptySummary(): array
    {
        return [
            'created' => 0,
            'updated' => 0,
            'skipped' => 0,
            'errors' => [],
        ];
    }
}
