import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Badge from '../../Components/Badge';
import Button from '../../Components/Button';
import { SelectInput, TextAreaInput, TextInput } from '../../Components/Form';
import Modal from '../../Components/Modal';
import Pagination from '../../Components/Pagination';
import AppLayout from '../../Layouts/AppLayout';
import { useAuth } from '../../lib/auth';

const tabs = ['All', 'Pending', 'Approved', 'Rejected'];

export default function Index({ leaves, viewAll, filters }) {
    const { can } = useAuth();
    const [open, setOpen] = useState(false);
    const form = useForm({ leave_type: '', start_date: '', end_date: '', reason: '' });

    const submit = (e) => {
        e.preventDefault();
        form.post('/leave-requests', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setOpen(false);
            },
        });
    };

    // Approve / reject are Inertia XHR requests (AJAX): the row updates in place.
    const review = (leave, status) => {
        router.patch(`/leave-requests/${leave.id}`, { status }, { preserveScroll: true });
    };

    const cancel = (leave) => {
        if (confirm('Remove this leave request?')) {
            router.delete(`/leave-requests/${leave.id}`, { preserveScroll: true });
        }
    };

    const activeTab = filters.status ?? 'All';

    return (
        <AppLayout title="Leave Requests">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Leave Requests</h1>
                    <p className="text-sm text-slate-500">
                        {viewAll ? 'Review and act on employee leave requests.' : 'Submit and track your own leave requests.'}
                    </p>
                </div>
                {can('leaves.request') && <Button onClick={() => setOpen(true)}>+ Request Leave</Button>}
            </div>

            <div className="mb-4 flex gap-1">
                {tabs.map((tab) => (
                    <Link
                        key={tab}
                        href="/leave-requests"
                        data={tab === 'All' ? {} : { status: tab }}
                        preserveState
                        className={`rounded-lg px-3 py-1.5 text-sm ${
                            activeTab === tab ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        {tab}
                    </Link>
                ))}
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50">
                        <tr className="text-left text-xs uppercase text-slate-500">
                            <th className="px-5 py-3">Employee</th>
                            <th className="px-5 py-3">Type</th>
                            <th className="px-5 py-3">Dates</th>
                            <th className="px-5 py-3">Reason</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {leaves.data.map((l) => (
                            <tr key={l.id}>
                                <td className="px-5 py-3 font-medium text-slate-800">{l.employee}</td>
                                <td className="px-5 py-3 text-slate-600">{l.leave_type}</td>
                                <td className="px-5 py-3 text-slate-600">
                                    {l.start_date} → {l.end_date}
                                </td>
                                <td className="max-w-xs truncate px-5 py-3 text-slate-600">{l.reason}</td>
                                <td className="px-5 py-3">
                                    <Badge>{l.status}</Badge>
                                    {l.reviewer && <p className="mt-1 text-xs text-slate-400">by {l.reviewer}</p>}
                                </td>
                                <td className="space-x-3 px-5 py-3 text-right">
                                    {can('leaves.review') && l.status === 'Pending' && (
                                        <>
                                            <button onClick={() => review(l, 'Approved')} className="text-xs font-medium text-teal-700 hover:underline">
                                                Approve
                                            </button>
                                            <button onClick={() => review(l, 'Rejected')} className="text-xs font-medium text-rose-600 hover:underline">
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {l.can_cancel && (
                                        <button onClick={() => cancel(l)} className="text-xs font-medium text-slate-500 hover:underline">
                                            Remove
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {leaves.data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-5 py-6 text-center text-slate-400">
                                    No leave requests yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination links={leaves.links} />

            <Modal open={open} onClose={() => setOpen(false)} title="Request leave">
                <form onSubmit={submit} className="space-y-4">
                    <SelectInput label="Leave type" name="leave_type" form={form}>
                        <option value="">Select a type</option>
                        <option>Sick</option>
                        <option>Vacation</option>
                        <option>Emergency</option>
                        <option>Others</option>
                    </SelectInput>
                    <div className="grid grid-cols-2 gap-3">
                        <TextInput label="Start date" name="start_date" type="date" form={form} />
                        <TextInput label="End date" name="end_date" type="date" form={form} />
                    </div>
                    <TextAreaInput label="Reason" name="reason" form={form} />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            Submit
                        </Button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
