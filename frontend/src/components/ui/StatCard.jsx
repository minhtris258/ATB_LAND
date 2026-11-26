export default function StatCard({ title, value, subtitle, icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        {icon && <div className="rounded-lg bg-blue-50 p-2 text-blue-600">{icon}</div>}
      </div>
      <div className="mt-3 text-2xl font-bold text-slate-900">{value}</div>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
}