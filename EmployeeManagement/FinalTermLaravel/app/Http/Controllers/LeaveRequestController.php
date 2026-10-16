<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LeaveRequestController extends Controller implements HasMiddleware
{
    private const STATUSES = ['Pending', 'Approved', 'Rejected'];

    public static function middleware(): array
    {
        return [
            new Middleware('permission:leaves.request', only: ['store']),
            new Middleware('permission:leaves.review', only: ['update']),
        ];
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $viewAll = $user->can('leaves.view-all');
        $status = in_array($request->status, self::STATUSES, true) ? $request->status : null;

        $leaves = LeaveRequest::with(['employee:id,first_name,last_name', 'reviewer:id,name'])
            ->when(! $viewAll, fn ($q) => $q->where('employee_id', $user->employee?->id))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (LeaveRequest $l) => [
                'id' => $l->id,
                'employee' => $l->employee->full_name,
                'leave_type' => $l->leave_type,
                'start_date' => $l->start_date->toDateString(),
                'end_date' => $l->end_date->toDateString(),
                'reason' => $l->reason,
                'status' => $l->status,
                'reviewer' => $l->reviewer?->name,
                'can_cancel' => $this->canCancel($user, $l),
            ]);

        return Inertia::render('Leaves/Index', [
            'leaves' => $leaves,
            'viewAll' => $viewAll,
            'filters' => ['status' => $status],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $employee = $request->user()->employee;

        if (! $employee) {
            return back()->with('error', 'Your account is not linked to an employee record.');
        }

        $data = $request->validate([
            'leave_type' => ['required', Rule::in(['Sick', 'Vacation', 'Emergency', 'Others'])],
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $employee->leaveRequests()->create($data + ['status' => 'Pending']);

        return back()->with('success', 'Leave request submitted.');
    }

    /** Approve or reject (AJAX-style Inertia request from the leave table). */
    public function update(Request $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['Approved', 'Rejected'])],
        ]);

        if ($leaveRequest->status !== 'Pending') {
            return back()->with('error', 'This request has already been reviewed.');
        }

        $leaveRequest->update([
            'status' => $data['status'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Leave request '.strtolower($data['status']).'.');
    }

    public function destroy(Request $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        abort_unless($this->canCancel($request->user(), $leaveRequest), 403);

        $leaveRequest->delete();

        return back()->with('success', 'Leave request removed.');
    }

    /** Owners can cancel their own pending requests; Admins can remove any. */
    private function canCancel($user, LeaveRequest $leave): bool
    {
        if ($user->hasRole('Admin')) {
            return true;
        }

        return $leave->status === 'Pending' && $leave->employee_id === $user->employee?->id;
    }
}
