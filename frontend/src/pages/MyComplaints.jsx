import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';

const complaints = [
  {
    id: 'CM-2048',
    title: 'Broken ceiling light in Chemistry Lab 2',
    status: 'InProgress',
    category: 'Electrical',
    location: 'Science Block',
    updated: '2 hours ago',
    priority: 'High',
  },
  {
    id: 'CM-2019',
    title: 'Water leakage near main cafeteria sink',
    status: 'Pending',
    category: 'Plumbing',
    location: 'Student Center',
    updated: '1 day ago',
    priority: 'Medium',
  },
  {
    id: 'CM-1987',
    title: 'Door access malfunction at Library entrance',
    status: 'Resolved',
    category: 'Security',
    location: 'Central Library',
    updated: '4 days ago',
    priority: 'Urgent',
  },
];

export default function MyComplaints() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">Your reports</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">My complaints</h1>
        </div>
        <Link to="/submit-complaint" className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
          Submit new report
        </Link>
      </div>

      <div className="space-y-4">
        {complaints.map((complaint) => (
          <Card key={complaint.id} className="p-0 overflow-hidden">
            <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-semibold text-blue-600">{complaint.id}</span>
                  <StatusBadge label={complaint.status === 'InProgress' ? 'In Progress' : complaint.status} type={complaint.status === 'InProgress' ? 'InProgress' : complaint.status} />
                </div>
                <Link to={`/complaint/${complaint.id}`} className="text-xl font-semibold text-slate-900 hover:text-blue-600">
                  {complaint.title}
                </Link>
              </div>

              <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Category</p>
                  <p className="mt-1 font-medium text-slate-700">{complaint.category}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Location</p>
                  <p className="mt-1 font-medium text-slate-700">{complaint.location}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Updated</p>
                  <p className="mt-1 font-medium text-slate-700">{complaint.updated}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
