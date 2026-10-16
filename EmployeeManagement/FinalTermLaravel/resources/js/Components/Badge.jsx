const tones = {
    Present: 'bg-teal-100 text-teal-800',
    Approved: 'bg-teal-100 text-teal-800',
    Active: 'bg-teal-100 text-teal-800',
    Late: 'bg-amber-100 text-amber-800',
    Pending: 'bg-amber-100 text-amber-800',
    Absent: 'bg-rose-100 text-rose-800',
    Rejected: 'bg-rose-100 text-rose-800',
    Inactive: 'bg-slate-200 text-slate-700',
};

export default function Badge({ children }) {
    return (
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[children] ?? 'bg-slate-100 text-slate-700'}`}>
            {children}
        </span>
    );
}
