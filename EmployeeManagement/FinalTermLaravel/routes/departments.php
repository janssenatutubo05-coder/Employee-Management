<?php

use App\Http\Controllers\DepartmentController;
use Illuminate\Support\Facades\Route;

Route::resource('departments', DepartmentController::class)
    ->except(['create', 'edit', 'show']);
