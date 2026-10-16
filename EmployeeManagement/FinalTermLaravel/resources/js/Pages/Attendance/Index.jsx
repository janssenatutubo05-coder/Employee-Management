import { router } from '@inertiajs/react';
import { useState } from 'react';
import Badge from '../../Components/Badge';
import Button from '../../Components/Button';
import Pagination from '../../Components/Pagination';
import AppLayout from '../../Layouts/AppLayout';
import { useAuth } from '../../lib/auth';

export default function Index({ records, today, viewAll, filters }) {
    const { can } = useAuth();
    const [busy, setBusy] = useState(false);

    // Time in / out are Inertia XHR requests (AJAX): the table updates without a page reload.
    const send = (method, url) => {
        router[method](url, {}, {
            preserveScroll: true,
            onStart: () => setBusy(true),
            onFinish: () => setBusy(false),
        });
    };

    const remove = (record) => {
        if (confirm('Delete this attendance record?')) {
            router.delete(`/attendance/${record.id}`, { preserveScroll: true });
        }
    };

    const filterByDate = (date) => {
        router.get('/attendance', date ? { date } : {}, { preserveState: true, replace: true });
    };

    return (
        <AppLayout title="Attendance">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Attendance</h1>
                    <p className="text-sm text-slate-500">Time in/out and daily attendance records.</p>
                </div>

                {can('attendance.record') && (
                    <div>
                        {!today && (
                            <Button disabled={busy} onClick={() => send('post', '/attendance/time-in')}>
                                Time In
                            </Button>
                        )}
                        {today && !today.time_out && (
                            <Button variant="danger" disabled={busy} onClick={() => send('patch', `/attendance/${today.id}/time-out`)}>
                                Time Out
                            </Button>
                        )}
                        {today?.time_out && (
                            <span className="text-sm text-slate-500">You're done for today. See you tomorrow!</span>
                        )}
                    </div>
                )}
            </div>

            {viewAll && (
                <div className="mb-4 flex items-center gap-2 text-sm">
                    <label htmlFor="date" className="text-slate-600">
                        Date
                    </label>
                    <input
                        id="date"
                        type="date"
                        value={filters.date ?? ''}
                        onChange={(e) => filterByDate(e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2"
                    />
                </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50">
                        <tr className="text-left text-xs uppercase text-slate-500">
                            <th className="px-5 py-3">Employee</th>
                            <th className="px-5 py-3">Date</th>
                            <th className="px-5 py-3">Time In</th>
                            <th className="px-5 py-3">Time Out</th>
                            <th className="px-5 py-3">Hours</th>
                            <th className="px-5 py-3">Status</th>
                            {can('attendance.manage') && <th className="px-5 py-3 text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {records.data.map((r) => (
                            <tr key={r.id}>
                                <td className="px-5 py-3 font-medium text-slate-800">{r.employee}</td>
                                <td className="px-5 py-3 text-slate-600">{r.date}</td>
                                <td className="px-5 py-3 text-slate-600">{r.time_in}</td>
                                <td className="px-5 py-3 text-slate-600">{r.time_out ?? '—'}</td>
                                <td className="px-5 py-3 text-slate-600">{r.hours_worked}</td>
                                <td className="px-5 py-3">
                                    <Badge>{r.status}</Badge>
                                </td>
                                {can('attendance.manage') && (
                                    <td className="px-5 py-3 text-right">
                                        <button onClick={() => remove(r)} className="text-xs font-medium text-rose-600 hover:underline">
                                            Delete
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {records.data.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-5 py-6 text-center text-slate-400">
                                    No attendance records yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination links={records.links} />
        </AppLayout>
    );
}
