export default function StatCard({ label, value, tone = 'text-slate-900' }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs text-slate-500">{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${tone}`}>{value}</p>
        </div>
    );
}
