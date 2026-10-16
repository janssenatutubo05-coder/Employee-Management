<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $organizationView = $user->can('attendance.view-all');

        return $organizationView
            ? $this->organization()
            : $this->personal($user->employee);
    }

    /** Admin / Manager view: the whole workforce at a glance. */
    private function organization(): Response
    {
        $totalEmployees = Employee::where('status', 'Active')->count();
        $presentToday = Attendance::whereDate('date', today())->where('status', '!=', 'Absent')->count();

        return Inertia::render('Dashboard', [
            'scope' => 'organization',
            'stats' => [
                'total_employees' => $totalEmployees,
                'present_today' => $presentToday,
                'absent_today' => max($totalEmployees - $presentToday, 0),
                'pending_leaves' => LeaveRequest::where('status', 'Pending')->count(),
            ],
            'recentAttendance' => Attendance::with('employee:id,first_name,last_name')
                ->latest('date')->latest('time_in')->take(5)->get()
                ->map(fn ($a) => [
                    'id' => $a->id,
                    'employee' => $a->employee->full_name,
                    'date' => $a->date->toDateString(),
                    'status' => $a->status,
                ]),
            'recentLeaves' => LeaveRequest::with('employee:id,first_name,last_name')
                ->latest()->take(5)->get()
                ->map(fn ($l) => [
                    'id' => $l->id,
                    'employee' => $l->employee->full_name,
                    'leave_type' => $l->leave_type,
                    'status' => $l->status,
                ]),
            'departments' => Department::withCount('employees')->orderByDesc('employees_count')->get()
                ->map(fn ($d) => ['id' => $d->id, 'name' => $d->name, 'employees_count' => $d->employees_count]),
        ]);
    }

    /** Employee view: only your own numbers. */
    private function personal(?Employee $employee): Response
    {
        $monthStart = now()->startOfMonth()->toDateString();

        $attendance = $employee
            ? $employee->attendances()->whereDate('date', '>=', $monthStart)
            : null;

        return Inertia::render('Dashboard', [
            'scope' => 'personal',
            'stats' => [
                'days_present' => $attendance ? (clone $attendance)->count() : 0,
                'hours_this_month' => $attendance ? (float) (clone $attendance)->sum('hours_worked') : 0,
                'pending_leaves' => $employee ? $employee->leaveRequests()->where('status', 'Pending')->count() : 0,
                'approved_leaves' => $employee ? $employee->leaveRequests()->where('status', 'Approved')->count() : 0,
            ],
            'today' => $employee?->attendances()->whereDate('date', today())->first()?->only(['id', 'time_in', 'time_out']),
            'recentAttendance' => $employee
                ? $employee->attendances()->latest('date')->take(5)->get()->map(fn ($a) => [
                    'id' => $a->id,
                    'employee' => $employee->full_name,
                    'date' => $a->date->toDateString(),
                    'status' => $a->status,
                ])
                : [],
            'recentLeaves' => $employee
                ? $employee->leaveRequests()->latest()->take(5)->get()->map(fn ($l) => [
                    'id' => $l->id,
                    'employee' => $employee->full_name,
                    'leave_type' => $l->leave_type,
                    'status' => $l->status,
                ])
                : [],
            'departments' => [],
        ]);
    }
}
