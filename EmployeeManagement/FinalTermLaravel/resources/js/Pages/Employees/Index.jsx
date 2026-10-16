import { Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import Badge from '../../Components/Badge';
import Pagination from '../../Components/Pagination';
import AppLayout from '../../Layouts/AppLayout';
import { useAuth } from '../../lib/auth';

export default function Index({ employees, departments, filters }) {
    const { can } = useAuth();
    const [search, setSearch] = useState(filters.search ?? '');
    const firstRender = useRef(true);

    // Debounced search: Inertia reloads only the employees prop.
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        const timer = setTimeout(() => applyFilters({ search }), 300);
        return () => clearTimeout(timer);
    }, [search]);

    const applyFilters = (changes) => {
        router.get(
            '/employees',
            { ...filters, ...changes },
            { preserveState: true, replace: true, only: ['employees', 'filters'] },
        );
    };

    const remove = (employee) => {
        if (confirm(`Delete ${employee.full_name}? Their attendance and leave records will be removed too.`)) {
            router.delete(`/employees/${employee.id}`, { preserveScroll: true });
        }
    };

    const selectClass = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm';

    return (
        <AppLayout title="Employees">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Employees</h1>
                    <p className="text-sm text-slate-500">Manage employee records.</p>
                </div>
                {can('employees.create') && (
                    <Link
                        href="/employees/create"
                        className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                    >
                        + Add Employee
                    </Link>
                )}
            </div>

            <div className="mb-4 flex flex-wrap gap-3">
                <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name or email"
                    className={`${selectClass} w-64`}
                />
                <select
                    value={filters.department ?? ''}
                    onChange={(e) => applyFilters({ department: e.target.value })}
                    className={selectClass}
                >
                    <option value="">All departments</option>
                    {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                            {d.name}
                        </option>
                    ))}
                </select>
                <select
                    value={filters.status ?? ''}
                    onChange={(e) => applyFilters({ status: e.target.value })}
                    className={selectClass}
                >
                    <option value="">All statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50">
                        <tr className="text-left text-xs uppercase text-slate-500">
                            <th className="px-5 py-3">Name</th>
                            <th className="px-5 py-3">Department</th>
                            <th className="px-5 py-3">Position</th>
                            <th className="px-5 py-3">Email</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {employees.data.map((e) => (
                            <tr key={e.id}>
                                <td className="px-5 py-3 font-medium text-slate-800">{e.full_name}</td>
                                <td className="px-5 py-3 text-slate-600">{e.department ?? '—'}</td>
                                <td className="px-5 py-3 text-slate-600">{e.position}</td>
                                <td className="px-5 py-3 text-slate-600">{e.email}</td>
                                <td className="px-5 py-3">
                                    <Badge>{e.status}</Badge>
                                </td>
                                <td className="space-x-3 px-5 py-3 text-right">
                                    <Link href={`/employees/${e.id}`} className="text-xs font-medium text-slate-600 hover:underline">
                                        View
                                    </Link>
                                    {can('employees.edit') && (
                                        <Link href={`/employees/${e.id}/edit`} className="text-xs font-medium text-teal-700 hover:underline">
                                            Edit
                                        </Link>
                                    )}
                                    {can('employees.delete') && (
                                        <button onClick={() => remove(e)} className="text-xs font-medium text-rose-600 hover:underline">
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {employees.data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-5 py-6 text-center text-slate-400">
                                    No employees found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination links={employees.links} />
        </AppLayout>
    );
}
