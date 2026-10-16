import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FlashMessage from '../Components/FlashMessage';
import { useAuth } from '../lib/auth';

const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/employees', label: 'Employees', permission: 'employees.view' },
    { href: '/departments', label: 'Departments', permission: 'departments.manage' },
    { href: '/attendance', label: 'Attendance' },
    { href: '/leave-requests', label: 'Leave Requests' },
];

export default function AppLayout({ title, children }) {
    const { url } = usePage();
    const { user, can } = useAuth();
    const [open, setOpen] = useState(false);

    const visibleItems = navItems.filter((item) => !item.permission || can(item.permission));

    return (
        <div className="min-h-screen md:flex">
            <Head title={title} />

            {/* Mobile top bar */}
            <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white md:hidden">
                <span className="font-semibold">PeopleHub</span>
                <button onClick={() => setOpen(!open)} className="rounded px-2 py-1 text-sm hover:bg-slate-800">
                    {open ? 'Close' : 'Menu'}
                </button>
            </div>

            <aside
                className={`${open ? 'block' : 'hidden'} w-full shrink-0 bg-slate-900 text-slate-200 md:flex md:min-h-screen md:w-64 md:flex-col`}
            >
                <div className="hidden border-b border-slate-800 px-6 py-5 md:block">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-400 font-bold text-slate-900">
                            P
                        </div>
                        <span className="text-lg font-semibold text-white">PeopleHub</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">Employee Information Management</p>
                </div>

                <nav className="flex-1 space-y-1 px-3 py-4">
                    {visibleItems.map((item) => {
                        const active = url.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                                    active ? 'bg-teal-400/10 text-teal-300' : 'text-slate-300 hover:bg-slate-800'
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-slate-800 px-3 py-4">
                    <div className="px-3 py-2 text-xs text-slate-400">
                        Signed in as
                        <br />
                        <span className="font-medium text-slate-200">{user.name}</span>
                        {user.roles.map((role) => (
                            <span
                                key={role}
                                className="ml-1 inline-block rounded bg-slate-800 px-1.5 py-0.5 text-[10px] uppercase tracking-wide"
                            >
                                {role}
                            </span>
                        ))}
                    </div>
                    <button
                        onClick={() => router.post('/logout')}
                        className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800"
                    >
                        Log out
                    </button>
                </div>
            </aside>

            <main className="min-w-0 flex-1 p-4 md:p-8">
                <FlashMessage />
                {children}
            </main>
        </div>
    );
}
