<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolesAndPermissionsSeeder::class);

        $departments = collect([
            'IT Department' => 'Systems, software and support',
            'HR Department' => 'Recruitment and employee relations',
            'Finance' => 'Payroll and accounting',
            'Operations' => 'Day-to-day business operations',
        ])->map(fn ($description, $name) => Department::create([
            'name' => $name,
            'description' => $description,
        ]));

        // Accounts you can log in with (all use the password: password)
        $accounts = [
            ['Janssen', 'Atutubo', 'admin@peoplehub.test', 'Admin', 'IT Department', 'System Administrator'],
            ['Jhaymer Jham', 'Dela Cruz', 'manager@peoplehub.test', 'Manager', 'HR Department', 'HR Manager'],
            ['Maria', 'Santos', 'employee@peoplehub.test', 'Employee', 'Finance', 'Accountant'],
        ];

        foreach ($accounts as [$first, $last, $email, $role, $department, $position]) {
            $user = User::create([
                'name' => "$first $last",
                'email' => $email,
                'password' => 'password',
            ]);
            $user->assignRole($role);

            Employee::create([
                'user_id' => $user->id,
                'department_id' => $departments[$department]->id,
                'first_name' => $first,
                'last_name' => $last,
                'email' => $email,
                'position' => $position,
                'status' => 'Active',
            ]);
        }

        // Extra employees without logins
        $others = [
            ['Carlo', 'Reyes', 'carlo.reyes@peoplehub.test', 'Operations', 'Operations Staff'],
            ['Angela', 'Mendoza', 'angela.mendoza@peoplehub.test', 'IT Department', 'Web Developer'],
            ['Paolo', 'Garcia', 'paolo.garcia@peoplehub.test', 'Finance', 'Payroll Clerk'],
        ];

        foreach ($others as [$first, $last, $email, $department, $position]) {
            Employee::create([
                'department_id' => $departments[$department]->id,
                'first_name' => $first,
                'last_name' => $last,
                'email' => $email,
                'position' => $position,
                'status' => 'Active',
            ]);
        }

        // A few days of sample attendance
        foreach (Employee::all() as $employee) {
            foreach ([1, 2, 3] as $daysAgo) {
                $date = now()->subDays($daysAgo);
                if ($date->isWeekend()) {
                    continue;
                }

                $late = ($employee->id + $daysAgo) % 4 === 0;

                Attendance::create([
                    'employee_id' => $employee->id,
                    'date' => $date->toDateString(),
                    'time_in' => $late ? '09:20:00' : '08:02:00',
                    'time_out' => '17:00:00',
                    'hours_worked' => $late ? 7.67 : 8.97,
                    'status' => $late ? 'Late' : 'Present',
                ]);
            }
        }

        // Sample leave requests
        $maria = Employee::where('email', 'employee@peoplehub.test')->first();
        $carlo = Employee::where('email', 'carlo.reyes@peoplehub.test')->first();

        LeaveRequest::create([
            'employee_id' => $maria->id,
            'leave_type' => 'Vacation',
            'start_date' => now()->addDays(10)->toDateString(),
            'end_date' => now()->addDays(12)->toDateString(),
            'reason' => 'Family trip',
            'status' => 'Pending',
        ]);

        LeaveRequest::create([
            'employee_id' => $carlo->id,
            'leave_type' => 'Sick',
            'start_date' => now()->subDays(5)->toDateString(),
            'end_date' => now()->subDays(4)->toDateString(),
            'reason' => 'Flu',
            'status' => 'Approved',
            'reviewed_by' => User::where('email', 'manager@peoplehub.test')->value('id'),
            'reviewed_at' => now()->subDays(6),
        ]);
    }
}
