const statusStyles = {
  Pending: 'bg-amber-100 text-amber-700',
  InProgress: 'bg-blue-100 text-blue-700',
  Resolved: 'bg-emerald-100 text-emerald-700',
  Closed: 'bg-slate-200 text-slate-700',
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-emerald-100 text-emerald-700',
};

export default function StatusBadge({ label, type = 'Pending' }) {
  const badgeStyle = statusStyles[type] || statusStyles.Pending;

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badgeStyle}`}>
      {label || type}
    </span>
  );
}
