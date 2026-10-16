<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    /** Arrivals after this time are marked "Late". */
    private const WORK_START = '09:00:00';

    public function index(Request $request): Response
    {
        $user = $request->user();
        $employee = $user->employee;
        $viewAll = $user->can('attendance.view-all');

        $records = Attendance::with('employee:id,first_name,last_name')
            ->when(! $viewAll, fn ($q) => $q->where('employee_id', $employee?->id))
            ->when($viewAll && $request->date, fn ($q) => $q->whereDate('date', $request->date))
            ->latest('date')
            ->latest('time_in')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Attendance $a) => [
                'id' => $a->id,
                'employee' => $a->employee->full_name,
                'date' => $a->date->toDateString(),
                'time_in' => $a->time_in,
                'time_out' => $a->time_out,
                'hours_worked' => $a->hours_worked,
                'status' => $a->status,
            ]);

        $today = $employee?->attendances()->whereDate('date', today())->first();

        return Inertia::render('Attendance/Index', [
            'records' => $records,
            'today' => $today ? $today->only(['id', 'time_in', 'time_out']) : null,
            'viewAll' => $viewAll,
            'filters' => $request->only('date'),
        ]);
    }

    /** AJAX-style action (Inertia XHR): clock in for today. */
    public function timeIn(Request $request): RedirectResponse
    {
        $employee = $request->user()->employee;

        if (! $employee) {
            return back()->with('error', 'Your account is not linked to an employee record.');
        }

        if ($employee->attendances()->whereDate('date', today())->exists()) {
            return back()->with('error', 'You have already timed in today.');
        }

        $now = now();

        Attendance::create([
            'employee_id' => $employee->id,
            'date' => $now->toDateString(),
            'time_in' => $now->format('H:i:s'),
            'status' => $now->format('H:i:s') > self::WORK_START ? 'Late' : 'Present',
        ]);

        return back()->with('success', 'Timed in at '.$now->format('g:i A').'.');
    }

    /** AJAX-style action (Inertia XHR): clock out and compute hours worked. */
    public function timeOut(Request $request, Attendance $attendance): RedirectResponse
    {
        $employee = $request->user()->employee;

        abort_unless($employee && $attendance->employee_id === $employee->id, 403);

        if ($attendance->time_out) {
            return back()->with('error', 'You have already timed out.');
        }

        $now = now();
        $start = Carbon::parse($attendance->date->toDateString().' '.$attendance->time_in);

        $attendance->update([
            'time_out' => $now->format('H:i:s'),
            'hours_worked' => round(abs($now->diffInMinutes($start)) / 60, 2),
        ]);

        return back()->with('success', 'Timed out at '.$now->format('g:i A').'.');
    }

    public function destroy(Attendance $attendance): RedirectResponse
    {
        $attendance->delete();

        return back()->with('success', 'Attendance record deleted.');
    }
}
