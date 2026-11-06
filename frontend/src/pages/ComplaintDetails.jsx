import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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

const normalizeStatus = (status) => {
  if (status === 'In Progress') return 'InProgress';
  return status;
};

export default function ComplaintDetails() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComplaint = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`http://localhost:5000/api/complaints/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || 'Unable to load complaint details.');
        }

        setComplaint(data);
      } catch (err) {
        setError(err.message || 'Something went wrong while loading this complaint.');
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      fetchComplaint();
    }
  }, [id, token]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="p-8 text-center text-sm text-slate-600">Loading complaint details...</Card>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="p-8 text-center text-sm text-red-700">{error || 'Complaint not found.'}</Card>
      </div>
    );
  }

  const categoryName = complaint.category?.name || complaint.category || 'Uncategorized';
  const locationName = complaint.location?.name || complaint.location || 'Not specified';
  const reporterName = complaint.reporter?.name || 'Unknown reporter';
  const reporterEmail = complaint.reporter?.email || 'N/A';
  const assignedName = complaint.assignedTo?.name || 'Unassigned';

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">Complaint details</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{complaint.title}</h1>
        </div>
        <Link
          to={user?.role === 'reporter' ? '/my-complaints' : '/dashboard'}
          className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Back to complaints
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <Card className="p-6">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-blue-600">#{complaint._id?.slice(-6).toUpperCase() || id}</span>
            <StatusBadge label={complaint.status === 'In Progress' ? 'In Progress' : complaint.status} type={normalizeStatus(complaint.status)} />
            <StatusBadge label={complaint.priority} type={complaint.priority} />
          </div>

          <div className="space-y-4 text-sm text-slate-600">
            <p>{complaint.description}</p>
          </div>

          <div className="mt-8 space-y-4 border-t border-slate-200 pt-6">
            <h2 className="text-lg font-semibold text-slate-900">Status history</h2>
            {(complaint.statusHistory || []).map((entry, index) => (
              <div key={`${entry.status}-${index}`} className="flex gap-3 rounded-xl bg-slate-50 p-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{entry.status}</p>
                  <p className="mt-1 text-sm text-slate-600">{entry.note || 'Updated'} </p>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(entry.changedAt)} by {entry.changedBy?.name || 'System'}</p>
                </div>
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
                <dd className="font-medium text-slate-700">{categoryName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Location</dt>
                <dd className="font-medium text-slate-700">{locationName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Priority</dt>
                <dd className="font-medium text-slate-700">{complaint.priority}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Submitted</dt>
                <dd className="font-medium text-slate-700">{formatDate(complaint.createdAt)}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-5">
            <h3 className="text-lg font-semibold text-slate-900">Reporter</h3>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">{reporterName}</p>
              <p className="mt-1 text-sm text-slate-600">{reporterEmail}</p>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-lg font-semibold text-slate-900">Assigned technician</h3>
            <div className="mt-4 rounded-2xl bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-700">{assignedName}</p>
              <p className="mt-1 text-sm text-blue-600">{complaint.assignedTo ? 'Technical support and facilities coordination' : 'No technician assigned yet'}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
