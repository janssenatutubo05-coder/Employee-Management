<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard');

// Every page below requires a logged-in user (Fortify handles login/register/reset).
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
});

// Feature routes live in their own files (modular routing).
Route::middleware('auth')->group(base_path('routes/departments.php'));
Route::middleware('auth')->group(base_path('routes/employees.php'));
Route::middleware('auth')->group(base_path('routes/attendance.php'));
Route::middleware('auth')->group(base_path('routes/leave-requests.php'));
