<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:employees.view', only: ['index', 'show']),
            new Middleware('permission:employees.create', only: ['create', 'store']),
            new Middleware('permission:employees.edit', only: ['edit', 'update']),
            new Middleware('permission:employees.delete', only: ['destroy']),
        ];
    }

    public function index(Request $request): Response
    {
        $employees = Employee::with('department:id,name')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->department, fn ($query, $id) => $query->where('department_id', $id))
            ->when($request->status, fn ($query, $status) => $query->where('status', $status))
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Employee $e) => [
                'id' => $e->id,
                'full_name' => $e->full_name,
                'email' => $e->email,
                'position' => $e->position,
                'status' => $e->status,
                'department' => $e->department?->name,
                'has_account' => $e->user_id !== null,
            ]);

        return Inertia::render('Employees/Index', [
            'employees' => $employees,
            'departments' => Department::orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['search', 'department', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Employees/Create', [
            'departments' => Department::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->rules());

        DB::transaction(function () use ($data) {
            $employee = Employee::create([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'position' => $data['position'],
                'department_id' => $data['department_id'] ?? null,
                'status' => $data['status'],
            ]);

            $this->createLogin($employee, $data);
        });

        return redirect()->route('employees.index')->with('success', 'Employee added.');
    }

    public function show(Employee $employee): Response
    {
        $employee->load('department:id,name');

        return Inertia::render('Employees/Show', [
            'employee' => [
                'id' => $employee->id,
                'full_name' => $employee->full_name,
                'email' => $employee->email,
                'position' => $employee->position,
                'status' => $employee->status,
                'department' => $employee->department?->name,
                'has_account' => $employee->user_id !== null,
            ],
            'attendances' => $employee->attendances()->latest('date')->take(5)->get()
                ->map(fn ($a) => [
                    'id' => $a->id,
                    'date' => $a->date->toDateString(),
                    'time_in' => $a->time_in,
                    'time_out' => $a->time_out,
                    'hours_worked' => $a->hours_worked,
                    'status' => $a->status,
                ]),
            'leaves' => $employee->leaveRequests()->latest()->take(5)->get()
                ->map(fn ($l) => [
                    'id' => $l->id,
                    'leave_type' => $l->leave_type,
                    'start_date' => $l->start_date->toDateString(),
                    'end_date' => $l->end_date->toDateString(),
                    'status' => $l->status,
                ]),
        ]);
    }

    public function edit(Employee $employee): Response
    {
        return Inertia::render('Employees/Edit', [
            'employee' => [
                'id' => $employee->id,
                'first_name' => $employee->first_name,
                'last_name' => $employee->last_name,
                'email' => $employee->email,
                'position' => $employee->position,
                'department_id' => $employee->department_id,
                'status' => $employee->status,
                'has_account' => $employee->user_id !== null,
            ],
            'departments' => Department::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Employee $employee): RedirectResponse
    {
        $data = $request->validate($this->rules($employee));

        DB::transaction(function () use ($employee, $data) {
            $employee->update([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'position' => $data['position'],
                'department_id' => $data['department_id'] ?? null,
                'status' => $data['status'],
            ]);

            // Keep the linked login in sync with the employee record.
            if ($employee->user) {
                $employee->user->update([
                    'name' => $employee->full_name,
                    'email' => $employee->email,
                ]);
            } else {
                $this->createLogin($employee, $data);
            }
        });

        return redirect()->route('employees.index')->with('success', 'Employee updated.');
    }

    public function destroy(Request $request, Employee $employee): RedirectResponse
    {
        if ($employee->user_id === $request->user()->id) {
            return back()->with('error', 'You cannot delete your own employee record.');
        }

        DB::transaction(function () use ($employee) {
            $user = $employee->user;
            $employee->delete(); // attendance + leave requests cascade
            $user?->delete();
        });

        return back()->with('success', 'Employee deleted.');
    }

    /** Validation rules shared by store() and update(). */
    private function rules(?Employee $employee = null): array
    {
        $rules = [
            'first_name' => ['required', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:50'],
            'email' => [
                'required', 'email', 'max:255',
                Rule::unique('employees', 'email')->ignore($employee?->id),
            ],
            'position' => ['required', 'string', 'max:100'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'status' => ['required', Rule::in(['Active', 'Inactive'])],
        ];

        // Optional login account, only offered while the employee has none.
        if (! $employee?->user_id) {
            $rules['password'] = ['nullable', 'string', 'min:8'];
            $rules['role'] = ['nullable', 'required_with:password', Rule::in(['Employee', 'Manager', 'Admin'])];
            // Only a clash with an existing login matters when we're creating one.
            if (request()->filled('password')) {
                $rules['email'][] = Rule::unique('users', 'email');
            }
        } else {
            // Linked login: the new email must not clash with another user.
            $rules['email'][] = Rule::unique('users', 'email')->ignore($employee->user_id);
        }

        return $rules;
    }

    private function createLogin(Employee $employee, array $data): void
    {
        if (empty($data['password'])) {
            return;
        }

        $user = User::create([
            'name' => $employee->full_name,
            'email' => $employee->email,
            'password' => $data['password'],
        ]);
        $user->assignRole($data['role'] ?? 'Employee');

        $employee->update(['user_id' => $user->id]);
    }
}
