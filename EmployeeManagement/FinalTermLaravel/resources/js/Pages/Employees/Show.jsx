import { Link } from '@inertiajs/react';
import Badge from '../../Components/Badge';
import AppLayout from '../../Layouts/AppLayout';
import { useAuth } from '../../lib/auth';

export default function Show({ employee, attendances, leaves }) {
    const { can } = useAuth();

    return (
        <AppLayout title={employee.full_name}>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">{employee.full_name}</h1>
                    <p className="text-sm text-slate-500">
                        {employee.position} · {employee.department ?? 'No department'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge>{employee.status}</Badge>
                    {can('employees.edit') && (
                        <Link href={`/employees/${employee.id}/edit`} className="text-sm font-medium text-teal-700 hover:underline">
                            Edit
                        </Link>
                    )}
                    <Link href="/employees" className="text-sm text-slate-500 hover:underline">
                        Back
                    </Link>
                </div>
            </div>

            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
                <p>Email: {employee.email}</p>
                <p className="mt-1">Login account: {employee.has_account ? 'Yes' : 'No'}</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <h2 className="mb-3 text-sm font-semibold text-slate-900">Recent Attendance</h2>
                    <table className="w-full text-sm">
                        <tbody className="divide-y divide-slate-100">
                            {attendances.map((a) => (
                                <tr key={a.id}>
                                    <td className="py-2 text-slate-600">{a.date}</td>
                                    <td className="py-2 text-slate-500">
                                        {a.time_in} – {a.time_out ?? '—'}
                                    </td>
                                    <td className="py-2 text-slate-500">{a.hours_worked} h</td>
                                    <td className="py-2 text-right">
                                        <Badge>{a.status}</Badge>
                                    </td>
                                </tr>
                            ))}
                            {attendances.length === 0 && (
                                <tr>
                                    <td className="py-4 text-center text-slate-400">No attendance yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <h2 className="mb-3 text-sm font-semibold text-slate-900">Recent Leave Requests</h2>
                    <table className="w-full text-sm">
                        <tbody className="divide-y divide-slate-100">
                            {leaves.map((l) => (
                                <tr key={l.id}>
                                    <td className="py-2 text-slate-600">{l.leave_type}</td>
                                    <td className="py-2 text-slate-500">
                                        {l.start_date} → {l.end_date}
                                    </td>
                                    <td className="py-2 text-right">
                                        <Badge>{l.status}</Badge>
                                    </td>
                                </tr>
                            ))}
                            {leaves.length === 0 && (
                                <tr>
                                    <td className="py-4 text-center text-slate-400">No leave requests yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
