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

const calculatePriorityScore = ({ severity, safetyRisk, affectedPeople, waitingLevel }) => {
  const value =
    0.35 * Number(severity || 0) +
    0.3 * Number(safetyRisk || 0) +
    0.2 * Number(affectedPeople || 0) +
    0.15 * Number(waitingLevel || 0);

  return Number(value.toFixed(2));
};

export default function ComplaintDetails() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingPriority, setSavingPriority] = useState(false);
  const [priorityMessage, setPriorityMessage] = useState('');
  const [priorityForm, setPriorityForm] = useState({
    severity: 1,
    safetyRisk: 1,
    affectedPeople: 1,
    waitingLevel: 1,
    estimatedDuration: '',
  });

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
        setPriorityForm({
          severity: Number(data.severity || 1),
          safetyRisk: Number(data.safetyRisk || 1),
          affectedPeople: Number(data.affectedPeople || 1),
          waitingLevel: Number(data.waitingLevel || 1),
          estimatedDuration: data.estimatedDuration ?? '',
        });
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

  const allowPriorityReview = user?.role === 'supervisor' || user?.role === 'admin';
  const computedPriorityScore = calculatePriorityScore(priorityForm);

  const markAsReviewed = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/complaints/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'Reviewed',
          note: 'Priority assessment completed and complaint marked as reviewed',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to mark the complaint as reviewed.');
      }

      const refreshedResponse = await fetch(`http://localhost:5000/api/complaints/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const refreshedData = await refreshedResponse.json();

      if (!refreshedResponse.ok) {
        throw new Error(refreshedData?.message || 'Unable to refresh complaint details.');
      }

      setComplaint(refreshedData);
      setPriorityMessage('Complaint marked as reviewed.');
    } catch (err) {
      setPriorityMessage(err.message || 'Unable to mark the complaint as reviewed.');
    }
  };

  const handlePriorityInputChange = (field, value) => {
    const numericValue = Number(value);
    if (!Number.isNaN(numericValue)) {
      const clampedValue = Math.min(Math.max(numericValue, 1), 5);
      setPriorityForm((previous) => ({ ...previous, [field]: clampedValue }));
      return;
    }

    setPriorityForm((previous) => ({ ...previous, [field]: value }));
  };

  const handlePrioritySubmit = async (event) => {
    event.preventDefault();

    if (!allowPriorityReview) {
      return;
    }

    setSavingPriority(true);
    setPriorityMessage('');

    try {
      const response = await fetch(`http://localhost:5000/api/complaints/${id}/priority`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          severity: Number(priorityForm.severity),
          safetyRisk: Number(priorityForm.safetyRisk),
          affectedPeople: Number(priorityForm.affectedPeople),
          waitingLevel: Number(priorityForm.waitingLevel),
          estimatedDuration: priorityForm.estimatedDuration === '' ? undefined : Number(priorityForm.estimatedDuration),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to update the priority assessment.');
      }

      setComplaint(data.complaint);
      setPriorityMessage('Priority assessment saved successfully.');
    } catch (err) {
      setPriorityMessage(err.message || 'Unable to update the priority assessment.');
    } finally {
      setSavingPriority(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="p-10 text-center text-sm text-slate-600">
          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-blue-100" />
          Loading complaint details...
        </Card>
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
      <div className="mb-8 rounded-[30px] border border-slate-200 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)] backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">Complaint details</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-900">{complaint.title}</h1>
          </div>
          <Link
            to={user?.role === 'reporter' ? '/my-complaints' : '/dashboard'}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            Back to complaints
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <Card className="p-6">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-blue-600">#{complaint._id?.slice(-6).toUpperCase() || id}</span>
            <StatusBadge label={complaint.status === 'In Progress' ? 'In Progress' : complaint.status} type={normalizeStatus(complaint.status)} />
          </div>

          <div className="space-y-4 text-sm leading-7 text-slate-600">
            <p>{complaint.description}</p>
          </div>

          <div className="mt-8 space-y-4 border-t border-slate-200 pt-6">
            <h2 className="text-lg font-semibold text-slate-900">Status history</h2>
            {(complaint.statusHistory || []).map((entry, index) => (
              <div key={`${entry.status}-${index}`} className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{entry.status}</p>
                  <p className="mt-1 text-sm text-slate-600">{entry.note || 'Updated'}</p>
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
                <dt className="text-slate-500">Priority score</dt>
                <dd className="font-medium text-slate-700">{Number(complaint.priorityScore || 0).toFixed(2)}</dd>
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

          {allowPriorityReview && (
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900">Priority assessment</h3>
                <div className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                  {computedPriorityScore.toFixed(2)}
                </div>
              </div>

              <form onSubmit={handlePrioritySubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'severity', label: 'Severity' },
                    { key: 'safetyRisk', label: 'Safety risk' },
                    { key: 'affectedPeople', label: 'Affected people' },
                    { key: 'waitingLevel', label: 'Waiting level' },
                  ].map((field) => (
                    <label key={field.key} className="block text-sm text-slate-600">
                      <span className="mb-1.5 block font-medium text-slate-700">{field.label}</span>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={priorityForm[field.key]}
                        onChange={(event) => handlePriorityInputChange(field.key, event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                  ))}
                </div>

                <label className="block text-sm text-slate-600">
                  <span className="mb-1.5 block font-medium text-slate-700">Estimated duration (minutes)</span>
                  <input
                    type="number"
                    min="0"
                    value={priorityForm.estimatedDuration}
                    onChange={(event) =>
                      setPriorityForm((previous) => ({
                        ...previous,
                        estimatedDuration: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Optional"
                  />
                </label>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Calculated priority score</p>
                  <p className="mt-1 text-2xl font-bold text-blue-900">{computedPriorityScore.toFixed(2)}</p>
                </div>

                {priorityMessage && (
                  <p className={`text-sm ${priorityMessage.includes('successfully') || priorityMessage.includes('reviewed') ? 'text-emerald-600' : 'text-red-600'}`}>
                    {priorityMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={savingPriority}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {savingPriority ? 'Saving...' : 'Save priority assessment'}
                </button>

                <button
                  type="button"
                  onClick={markAsReviewed}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                >
                  Mark as Reviewed
                </button>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
