<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\HubController;
use App\Http\Controllers\Api\ShiftController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

Route::middleware('auth:sanctum')->group(function (): void {
    Route::middleware('role:super_admin,admin_gudang,manager_gudang')->group(function (): void {
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::get('/categories/{category}', [CategoryController::class, 'show']);
        Route::get('/hubs', [HubController::class, 'index']);
        Route::get('/hubs/{hub}', [HubController::class, 'show']);
        Route::get('/shifts', [ShiftController::class, 'index']);
        Route::get('/shifts/{shift}', [ShiftController::class, 'show']);
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
});
