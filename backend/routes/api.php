<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EoqCalculationController;
use App\Http\Controllers\Api\HubController;
use App\Http\Controllers\Api\ImportExport\ImportExportController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PurchaseRecommendationController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RopCalculationController;
use App\Http\Controllers\Api\ShiftController;
use App\Http\Controllers\Api\StockTransactionController;
use App\Http\Controllers\Api\SupplierController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

Route::middleware('auth:sanctum')->group(function (): void {
    Route::middleware('role:super_admin')->group(function (): void {
        Route::get('/users/template', [ImportExportController::class, 'template'])->defaults('type', 'users');
        Route::post('/users/import', [ImportExportController::class, 'import'])->defaults('type', 'users');
        Route::get('/hubs/template', [ImportExportController::class, 'template'])->defaults('type', 'hubs');
        Route::post('/hubs/import', [ImportExportController::class, 'import'])->defaults('type', 'hubs');
        Route::get('/categories/template', [ImportExportController::class, 'template'])->defaults('type', 'categories');
        Route::post('/categories/import', [ImportExportController::class, 'import'])->defaults('type', 'categories');
        Route::get('/shifts/template', [ImportExportController::class, 'template'])->defaults('type', 'shifts');
        Route::post('/shifts/import', [ImportExportController::class, 'import'])->defaults('type', 'shifts');
    });

    Route::middleware('role:super_admin,admin_gudang')->group(function (): void {
        Route::get('/suppliers/template', [ImportExportController::class, 'template'])->defaults('type', 'suppliers');
        Route::post('/suppliers/import', [ImportExportController::class, 'import'])->defaults('type', 'suppliers');
        Route::get('/products/template', [ImportExportController::class, 'template'])->defaults('type', 'products');
        Route::post('/products/import', [ImportExportController::class, 'import'])->defaults('type', 'products');
        Route::get('/stock-transactions/template', [ImportExportController::class, 'template'])->defaults('type', 'stock-transactions');
        Route::post('/stock-transactions/import', [ImportExportController::class, 'import'])->defaults('type', 'stock-transactions');
    });

    Route::middleware('role:super_admin,admin_gudang,manager_gudang')->group(function (): void {
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::get('/categories/{category}', [CategoryController::class, 'show']);
        Route::get('/hubs', [HubController::class, 'index']);
        Route::get('/hubs/{hub}', [HubController::class, 'show']);
        Route::get('/shifts', [ShiftController::class, 'index']);
        Route::get('/shifts/{shift}', [ShiftController::class, 'show']);
        Route::get('/suppliers', [SupplierController::class, 'index']);
        Route::get('/suppliers/{supplier}', [SupplierController::class, 'show']);
        Route::get('/products', [ProductController::class, 'index']);
        Route::get('/products/{product}', [ProductController::class, 'show']);
        Route::get('/inventories', [InventoryController::class, 'index']);
        Route::get('/inventories/{inventory}', [InventoryController::class, 'show']);
        Route::get('/stock-transactions', [StockTransactionController::class, 'index']);
        Route::get('/stock-transactions/{stockTransaction}', [StockTransactionController::class, 'show']);
        Route::get('/eoq-calculations', [EoqCalculationController::class, 'index']);
        Route::get('/eoq-calculations/{eoqCalculation}', [EoqCalculationController::class, 'show']);
        Route::get('/rop-calculations', [RopCalculationController::class, 'index']);
        Route::get('/rop-calculations/{ropCalculation}', [RopCalculationController::class, 'show']);
        Route::get('/purchase-recommendations', [PurchaseRecommendationController::class, 'index']);
        Route::get('/purchase-recommendations/{purchaseRecommendation}', [PurchaseRecommendationController::class, 'show']);
        Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
        Route::get('/dashboard/critical-stock', [DashboardController::class, 'criticalStock']);
        Route::get('/dashboard/reorder-alerts', [DashboardController::class, 'reorderAlerts']);
        Route::get('/reports/inventory', [ReportController::class, 'inventory']);
        Route::get('/reports/eoq-rop', [ReportController::class, 'eoqRop']);
    });

    Route::middleware('role:super_admin')->group(function (): void {
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
        Route::post('/hubs', [HubController::class, 'store']);
        Route::put('/hubs/{hub}', [HubController::class, 'update']);
        Route::delete('/hubs/{hub}', [HubController::class, 'destroy']);
        Route::post('/shifts', [ShiftController::class, 'store']);
        Route::put('/shifts/{shift}', [ShiftController::class, 'update']);
        Route::delete('/shifts/{shift}', [ShiftController::class, 'destroy']);
    });

    Route::middleware('role:super_admin,admin_gudang')->group(function (): void {
        Route::post('/suppliers', [SupplierController::class, 'store']);
        Route::put('/suppliers/{supplier}', [SupplierController::class, 'update']);
        Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy']);
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
        Route::post('/stock-transactions', [StockTransactionController::class, 'store']);
        Route::post('/eoq-calculations', [EoqCalculationController::class, 'store']);
        Route::post('/rop-calculations', [RopCalculationController::class, 'store']);
        Route::post('/purchase-recommendations/generate', [PurchaseRecommendationController::class, 'generate']);
    });

    Route::middleware('role:super_admin,manager_gudang')->group(function (): void {
        Route::put('/purchase-recommendations/{purchaseRecommendation}/approve', [PurchaseRecommendationController::class, 'approve']);
        Route::put('/purchase-recommendations/{purchaseRecommendation}/reject', [PurchaseRecommendationController::class, 'reject']);
    });
});
