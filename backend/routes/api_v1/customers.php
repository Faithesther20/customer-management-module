<?php

use Illuminate\Http\Request;
use App\Http\Controllers\Api\V1\CustomerController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {

    // Customer CRUD
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::post('/customers', [CustomerController::class, 'store']);
    Route::get('/customers/{id}', [CustomerController::class, 'show']);
    Route::put('/customers/{id}', [CustomerController::class, 'update']);
    Route::delete('/customers/{id}', [CustomerController::class, 'destroy']);

    // Customer Processing (Import/Export)
    Route::prefix('customers/process')->group(function () {
        Route::post('/import', [CustomerController::class, 'import']);
        Route::get('/export', [CustomerController::class, 'export']);
    });
});
