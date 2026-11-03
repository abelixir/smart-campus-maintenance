import { Link, useParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';

const complaintData = {
  'CM-2048': {
    id: 'CM-2048',
    title: 'Broken ceiling light in Chemistry Lab 2',
    category: 'Electrical',
    location: 'Science Block, Chemistry Lab 2',
    priority: 'High',
    status: 'InProgress',
    submitted: 'October 28, 2026',
    description:
      'The ceiling light in the chemistry lab has been flickering intermittently for the past three days. This is affecting student visibility during practical sessions and creating a safety issue during equipment handling.',
    assignedTo: 'Maintenance Team A',
    notes: [
      'Inspection scheduled for 09:30 AM tomorrow.',
      'Electrical wiring review requested by facilities staff.',
      'Temporary lighting has been arranged for safety.',
    ],
  },
};

export default function ComplaintDetails() {
  const { id } = useParams();
  const complaint = complaintData[id] || complaintData['CM-2048'];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">Complaint details</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{complaint.title}</h1>
        </div>
        <Link to="/my-complaints" className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
          Back to complaints
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <Card className="p-6">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-blue-600">{complaint.id}</span>
            <StatusBadge label={complaint.status === 'InProgress' ? 'In Progress' : complaint.status} type={complaint.status === 'InProgress' ? 'InProgress' : complaint.status} />
            <StatusBadge label={complaint.priority} type={complaint.priority} />
          </div>

          <div className="space-y-4 text-sm text-slate-600">
            <p>{complaint.description}</p>
          </div>

          <div className="mt-8 space-y-4 border-t border-slate-200 pt-6">
            <h2 className="text-lg font-semibold text-slate-900">Activity updates</h2>
            {complaint.notes.map((note, index) => (
              <div key={index} className="flex gap-3 rounded-xl bg-slate-50 p-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
                <p className="text-sm text-slate-700">{note}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-slate-900">Issue overview</h3>
            <dl className="mt-4 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Category</dt>
                <dd className="font-medium text-slate-700">{complaint.category}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Location</dt>
                <dd className="font-medium text-slate-700">{complaint.location}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Priority</dt>
                <dd className="font-medium text-slate-700">{complaint.priority}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Submitted</dt>
                <dd className="font-medium text-slate-700">{complaint.submitted}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-5">
            <h3 className="text-lg font-semibold text-slate-900">Assigned team</h3>
            <div className="mt-4 rounded-2xl bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-700">{complaint.assignedTo}</p>
              <p className="mt-1 text-sm text-blue-600">Technical support and facilities coordination</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
