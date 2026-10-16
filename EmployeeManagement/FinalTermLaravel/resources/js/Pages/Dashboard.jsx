import { Link } from '@inertiajs/react';
import Badge from '../Components/Badge';
import StatCard from '../Components/StatCard';
import AppLayout from '../Layouts/AppLayout';

function RecentTable({ title, rows, columns, empty, href }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
                <Link href={href} className="text-xs text-teal-700 hover:underline">
                    View all
                </Link>
            </div>
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left text-xs uppercase text-slate-400">
                        {columns.map((c) => (
                            <th key={c.key} className="pb-2 font-medium">
                                {c.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {rows.map((row) => (
                        <tr key={row.id}>
                            {columns.map((c) => (
                                <td key={c.key} className="py-2 text-slate-600">
                                    {c.key === 'status' ? <Badge>{row.status}</Badge> : row[c.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                    {rows.length === 0 && (
                        <tr>
                            <td colSpan={columns.length} className="py-4 text-center text-slate-400">
                                {empty}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default function Dashboard({ scope, stats, recentAttendance, recentLeaves, departments, today }) {
    const organization = scope === 'organization';

    return (
        <AppLayout title="Dashboard">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-500">
                    {organization ? "Overview of today's workforce activity." : 'Your attendance and leave at a glance.'}
                </p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {organization ? (
                    <>
                        <StatCard label="Active Employees" value={stats.total_employees} />
                        <StatCard label="Present Today" value={stats.present_today} tone="text-teal-600" />
                        <StatCard label="Absent Today" value={stats.absent_today} tone="text-rose-500" />
                        <StatCard label="Pending Leave Requests" value={stats.pending_leaves} tone="text-amber-500" />
                    </>
                ) : (
                    <>
                        <StatCard label="Days Present (this month)" value={stats.days_present} tone="text-teal-600" />
                        <StatCard label="Hours Worked (this month)" value={stats.hours_this_month} />
                        <StatCard label="Pending Leave Requests" value={stats.pending_leaves} tone="text-amber-500" />
                        <StatCard label="Approved Leaves" value={stats.approved_leaves} tone="text-teal-600" />
                    </>
                )}
            </div>

            {!organization && (
                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
                    {today?.time_out
                        ? `You're done for today (in ${today.time_in}, out ${today.time_out}).`
                        : today
                          ? `You timed in at ${today.time_in}. Don't forget to time out.`
                          : "You haven't timed in today."}{' '}
                    <Link href="/attendance" className="font-medium text-teal-700 hover:underline">
                        Go to attendance
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <RecentTable
                    title="Recent Attendance"
                    href="/attendance"
                    rows={recentAttendance}
                    empty="No attendance records yet."
                    columns={[
                        { key: 'employee', label: 'Employee' },
                        { key: 'date', label: 'Date' },
                        { key: 'status', label: 'Status' },
                    ]}
                />
                <RecentTable
                    title="Recent Leave Requests"
                    href="/leave-requests"
                    rows={recentLeaves}
                    empty="No leave requests yet."
                    columns={[
                        { key: 'employee', label: 'Employee' },
                        { key: 'leave_type', label: 'Type' },
                        { key: 'status', label: 'Status' },
                    ]}
                />
            </div>

            {organization && departments.length > 0 && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
                    <h2 className="mb-3 text-sm font-semibold text-slate-900">Employees by Department</h2>
                    <div className="space-y-2">
                        {departments.map((d) => {
                            const max = Math.max(...departments.map((x) => x.employees_count), 1);
                            return (
                                <div key={d.id} className="flex items-center gap-3 text-sm">
                                    <span className="w-36 shrink-0 text-slate-600">{d.name}</span>
                                    <div className="h-2 flex-1 rounded-full bg-slate-100">
                                        <div
                                            className="h-2 rounded-full bg-teal-500"
                                            style={{ width: `${(d.employees_count / max) * 100}%` }}
                                        />
                                    </div>
                                    <span className="w-6 text-right text-slate-500">{d.employees_count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
