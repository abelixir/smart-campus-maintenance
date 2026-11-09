const statusStyles = {
  Pending: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  Submitted: 'bg-sky-100 text-sky-700 ring-1 ring-sky-200',
  InProgress: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  Assigned: 'bg-violet-100 text-violet-700 ring-1 ring-violet-200',
  Resolved: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  Closed: 'bg-slate-200 text-slate-700 ring-1 ring-slate-300',
  Rejected: 'bg-red-100 text-red-700 ring-1 ring-red-200',
  High: 'bg-red-100 text-red-700 ring-1 ring-red-200',
  Medium: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  Low: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  Urgent: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
};

export default function StatusBadge({ label, type = 'Pending' }) {
  const badgeStyle = statusStyles[type] || statusStyles.Pending;

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${badgeStyle}`}>
      {label || type}
    </span>
  );
}
