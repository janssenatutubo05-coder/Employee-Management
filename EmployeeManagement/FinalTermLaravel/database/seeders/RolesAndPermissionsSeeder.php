<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'employees.view',
            'employees.create',
            'employees.edit',
            'employees.delete',
            'departments.manage',
            'attendance.record',      // time in / time out for yourself
            'attendance.view-all',    // see everyone's attendance
            'attendance.manage',      // delete attendance records
            'leaves.request',         // file your own leave request
            'leaves.view-all',        // see everyone's leave requests
            'leaves.review',          // approve / reject
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        Role::findOrCreate('Admin', 'web')->syncPermissions(Permission::all());

        Role::findOrCreate('Manager', 'web')->syncPermissions([
            'employees.view',
            'attendance.record',
            'attendance.view-all',
            'leaves.request',
            'leaves.view-all',
            'leaves.review',
        ]);

        Role::findOrCreate('Employee', 'web')->syncPermissions([
            'attendance.record',
            'leaves.request',
        ]);
    }
}
