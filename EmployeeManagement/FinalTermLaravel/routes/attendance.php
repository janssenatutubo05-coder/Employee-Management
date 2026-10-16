<?php

use App\Http\Controllers\AttendanceController;
use Illuminate\Support\Facades\Route;

Route::prefix('attendance')->name('attendance.')->group(function () {
    Route::get('/', [AttendanceController::class, 'index'])->name('index');

    Route::post('/time-in', [AttendanceController::class, 'timeIn'])
        ->middleware('permission:attendance.record')
        ->name('time-in');

    Route::patch('/{attendance}/time-out', [AttendanceController::class, 'timeOut'])
        ->middleware('permission:attendance.record')
        ->name('time-out');

    Route::delete('/{attendance}', [AttendanceController::class, 'destroy'])
        ->middleware('permission:attendance.manage')
        ->name('destroy');
});
