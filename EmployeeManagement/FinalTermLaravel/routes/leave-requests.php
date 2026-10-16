<?php

use App\Http\Controllers\LeaveRequestController;
use Illuminate\Support\Facades\Route;

Route::resource('leave-requests', LeaveRequestController::class)
    ->parameters(['leave-requests' => 'leaveRequest'])
    ->only(['index', 'store', 'update', 'destroy']);
