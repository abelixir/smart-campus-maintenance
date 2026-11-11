import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';

const formatDate = (value) => {
  if (!value) return 'N/A';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
};

const getStatusBadgeType = (status) => {
  if (status === 'InProgress') return 'InProgress';
  if (status === 'Submitted') return 'Submitted';
  return status;
};

const getStatusLabel = (status) => {
  if (status === 'InProgress') return 'In Progress';
  return status;
};

export default function MyComplaints() {
  const { user, token } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  if (user?.role !== 'reporter') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="p-10 text-center">
          <h1 className="text-2xl font-bold tracking-[-0.04em] text-slate-900">Access denied</h1>
          <p className="mt-2 text-sm text-slate-600">This page is only available to reporters.</p>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('http://localhost:5000/api/complaints/my', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || 'Unable to load your complaints.');
        }

        setComplaints(data.complaints || []);
      } catch (err) {
        setError(err.message || 'Something went wrong while loading your complaints.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchComplaints();
    }
  }, [token]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-[30px] border border-slate-200 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)] backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">Your reports</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-900">My complaints</h1>
          </div>
          <Link to="/submit-complaint" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.22)] transition hover:translate-y-[-1px]">
            Submit new report
          </Link>
        </div>
      </div>

      {loading ? (
        <Card className="p-10 text-center text-sm text-slate-600">
          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-blue-100" />
          Loading your complaints...
        </Card>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      ) : complaints.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-8 w-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8M8 12h8M8 17h5M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v9A2.5 2.5 0 0 1 16.5 19h-9A2.5 2.5 0 0 1 5 16.5v-9Z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900">No complaints yet</h2>
          <p className="mt-2 text-sm text-slate-600">Your submitted reports will appear here once you file a new complaint.</p>
          <Link to="/submit-complaint" className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.22)] transition hover:translate-y-[-1px]">
            Submit your first complaint
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => {
            const complaintId = complaint._id || complaint.id;
            const categoryName = complaint.category?.name || complaint.category || 'Uncategorized';
            const locationName = complaint.location?.name || complaint.location || 'Not specified';
            const statusLabel = getStatusLabel(complaint.status);
            const statusType = getStatusBadgeType(complaint.status);

            return (
              <Card key={complaintId} className="overflow-hidden p-0">
                <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-semibold text-blue-600">{complaintId.slice ? complaintId.slice(-6).toUpperCase() : complaintId}</span>
                      <StatusBadge label={statusLabel} type={statusType} />
                    </div>
                    <Link to={`/complaint/${complaintId}`} className="text-xl font-semibold text-slate-900 transition hover:text-blue-600">
                      {complaint.title}
                    </Link>
                  </div>

                  <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Category</p>
                      <p className="mt-1 font-medium text-slate-700">{categoryName}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Location</p>
                      <p className="mt-1 font-medium text-slate-700">{locationName}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Submitted</p>
                      <p className="mt-1 font-medium text-slate-700">{formatDate(complaint.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
