import { Head } from '@inertiajs/react';

export default function GuestLayout({ title, subtitle, children }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <Head title={title} />
            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-6 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 font-bold text-white">
                        P
                    </div>
                    <div>
                        <p className="font-semibold leading-tight text-slate-900">PeopleHub</p>
                        <p className="text-xs text-slate-500">Employee Information Management</p>
                    </div>
                </div>
                {subtitle && <p className="mb-4 text-sm text-slate-500">{subtitle}</p>}
                {children}
            </div>
        </div>
    );
}
