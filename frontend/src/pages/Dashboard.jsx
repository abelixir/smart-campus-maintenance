import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';

const statusOptions = [
  'Submitted',
  'Reviewed',
  'Scheduled',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
  'Rejected',
];

const getStatusBadgeType = (status) => {
  if (status === 'In Progress') return 'InProgress';
  return status;
};

const getStatusLabel = (status) => {
  if (status === 'In Progress') return 'In Progress';
  return status;
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
};

export default function Dashboard() {
  const { user, token } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const role = user?.role || 'reporter';

  const fetchComplaints = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/complaints', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to load complaints.');
      }

      setComplaints(data.complaints || []);
    } catch (err) {
      setError(err.message || 'Failed to load complaints.');
    }
  };

  const fetchUsers = async () => {
    if (!['supervisor', 'admin'].includes(role)) return;

    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to load technicians.');
      }

      const technicians = (data.users || []).filter((person) => person.role === 'technician');
      setUsers(technicians);
    } catch (err) {
      setError(err.message || 'Failed to load technician list.');
    }
  };

  const fetchRecommendations = async () => {
    if (!['supervisor', 'admin'].includes(role)) return;

    try {
      const response = await fetch('http://localhost:5000/api/complaints/recommendations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to load recommendations.');
      }

      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError(err.message || 'Failed to load technician recommendations.');
    }
  };

  const fetchEvaluation = async () => {
    if (!['supervisor', 'admin'].includes(role)) return;

    try {
      const response = await fetch('http://localhost:5000/api/complaints/evaluation', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to load comparison data.');
      }

      setEvaluation(data);
    } catch (err) {
      // Do not break the whole dashboard if evaluation fails
      console.error(err);
    }
  };

  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      setLoading(true);
      setError('');
      await Promise.all([fetchComplaints(), fetchUsers(), fetchRecommendations(), fetchEvaluation()]);
      setLoading(false);
    };

    loadData();
  }, [token, role]);

  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/complaints/${complaintId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, note: `Status changed to ${newStatus}` }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to update complaint status.');
      }

      setComplaints((prev) =>
        prev.map((item) => (item._id === complaintId ? { ...item, status: newStatus } : item))
      );
    } catch (err) {
      setError(err.message || 'Failed to update complaint status.');
    }
  };

  const assignComplaint = async (complaintId, technicianId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/complaints/${complaintId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ technicianId, note: 'Complaint assigned to technician' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to assign complaint.');
      }

      setComplaints((prev) =>
        prev.map((item) =>
          item._id === complaintId
            ? { ...item, assignedTo: data.complaint.assignedTo, status: 'Assigned' }
            : item
        )
      );

      setRecommendations((prev) => prev.filter((item) => item.complaintId !== complaintId));

      return data.complaint;
    } catch (err) {
      setError(err.message || 'Failed to assign complaint.');
      return null;
    }
  };

  const approveRecommendation = async (recommendation) => {
    if (
      !recommendation ||
      recommendation.requiresSupervisorAction ||
      !recommendation.recommendedTechnicianId
    ) {
      return;
    }

    const approvedComplaint = await assignComplaint(
      recommendation.complaintId,
      recommendation.recommendedTechnicianId
    );

    if (approvedComplaint) {
      await fetchRecommendations();
      await fetchEvaluation();
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="p-10 text-center text-sm text-slate-600">
          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-blue-100" />
          Loading dashboard...
        </Card>
      </div>
    );
  }

  const reporterComplaints = complaints.filter(
    (item) => item.reporter?._id === user?._id || item.reporter === user?._id
  );
  const assignedComplaints = complaints.filter(
    (item) => item.assignedTo?._id === user?._id || item.assignedTo === user?._id
  );
  const openAssignedComplaints = assignedComplaints.filter(
    (item) => !['Resolved', 'Closed'].includes(item.status)
  );
  const pendingSupervisorComplaints = complaints.filter(
    (item) => !['Resolved', 'Closed'].includes(item.status)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-[30px] border border-slate-200 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)] backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">
              Operations overview
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-900">Dashboard</h1>
          </div>
          {role === 'reporter' && (
            <Link
              to="/submit-complaint"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.22)] transition hover:translate-y-[-1px]"
            >
              Submit new complaint
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Reporter Dashboard */}
      {role === 'reporter' && (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <Card hover className="p-5">
              <p className="text-sm text-slate-500">Your complaints</p>
              <div className="mt-4 text-3xl font-bold tracking-[-0.05em] text-slate-900">
                {reporterComplaints.length}
              </div>
            </Card>
            <Card hover className="p-5">
              <p className="text-sm text-slate-500">Open</p>
              <div className="mt-4 text-3xl font-bold tracking-[-0.05em] text-slate-900">
                {reporterComplaints.filter((item) => !['Resolved', 'Closed'].includes(item.status)).length}
              </div>
            </Card>
            <Card hover className="p-5">
              <p className="text-sm text-slate-500">Resolved</p>
              <div className="mt-4 text-3xl font-bold tracking-[-0.05em] text-slate-900">
                {reporterComplaints.filter((item) => item.status === 'Resolved').length}
              </div>
            </Card>
          </div>

          <Card className="mt-8 overflow-hidden p-0">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Recent complaints</h2>
            </div>
            <div className="divide-y divide-slate-200">
              {reporterComplaints.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-base font-medium text-slate-900">No complaints yet</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Your latest reports will appear here once you submit one.
                  </p>
                </div>
              ) : (
                reporterComplaints.slice(0, 5).map((complaint) => (
                  <div
                    key={complaint._id}
                    className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <Link
                        to={`/complaint/${complaint._id}`}
                        className="text-sm font-semibold text-slate-900 hover:text-blue-600"
                      >
                        {complaint.title}
                      </Link>
                      <p className="mt-1 text-sm text-slate-500">
                        {complaint.location?.name || complaint.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge
                        label={getStatusLabel(complaint.status)}
                        type={getStatusBadgeType(complaint.status)}
                      />
                      <StatusBadge label={complaint.priority} type={complaint.priority} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </>
      )}

      {/* Technician Dashboard */}
      {role === 'technician' && (
        <>
          <div className="mb-6 grid gap-5 md:grid-cols-3">
            <Card hover className="p-5">
              <p className="text-sm text-slate-500">Assigned work</p>
              <div className="mt-4 text-3xl font-bold tracking-[-0.05em] text-slate-900">
                {assignedComplaints.length}
              </div>
            </Card>
            <Card hover className="p-5">
              <p className="text-sm text-slate-500">Open tasks</p>
              <div className="mt-4 text-3xl font-bold tracking-[-0.05em] text-slate-900">
                {openAssignedComplaints.length}
              </div>
            </Card>
            <Card hover className="p-5">
              <p className="text-sm text-slate-500">Resolved</p>
              <div className="mt-4 text-3xl font-bold tracking-[-0.05em] text-slate-900">
                {assignedComplaints.filter((item) => item.status === 'Resolved').length}
              </div>
            </Card>
          </div>

          <Card className="overflow-hidden p-0">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Assigned complaints</h2>
            </div>
            <div className="divide-y divide-slate-200">
              {assignedComplaints.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-base font-medium text-slate-900">No assignments</p>
                  <p className="mt-2 text-sm text-slate-500">
                    New tasks assigned to you will appear here.
                  </p>
                </div>
              ) : (
                assignedComplaints.map((complaint) => (
                  <div
                    key={complaint._id}
                    className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div>
                      <Link
                        to={`/complaint/${complaint._id}`}
                        className="text-sm font-semibold text-slate-900 hover:text-blue-600"
                      >
                        {complaint.title}
                      </Link>
                      <p className="mt-1 text-sm text-slate-500">
                        {complaint.location?.name || complaint.location}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <StatusBadge
                        label={getStatusLabel(complaint.status)}
                        type={getStatusBadgeType(complaint.status)}
                      />
                      <select
                        value={complaint.status}
                        onChange={(e) => updateComplaintStatus(complaint._id, e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </>
      )}

      {/* Supervisor / Admin Dashboard */}
      {(role === 'supervisor' || role === 'admin') && (
        <>
          <div className="mb-6 grid gap-5 md:grid-cols-3">
            <Card hover className="p-5">
              <p className="text-sm text-slate-500">Total queue</p>
              <div className="mt-4 text-3xl font-bold tracking-[-0.05em] text-slate-900">
                {pendingSupervisorComplaints.length}
              </div>
            </Card>
            <Card hover className="p-5">
              <p className="text-sm text-slate-500">Pending</p>
              <div className="mt-4 text-3xl font-bold tracking-[-0.05em] text-slate-900">
                {
                  pendingSupervisorComplaints.filter((item) =>
                    ['Submitted', 'Reviewed'].includes(item.status)
                  ).length
                }
              </div>
            </Card>
            <Card hover className="p-5">
              <p className="text-sm text-slate-500">Technicians</p>
              <div className="mt-4 text-3xl font-bold tracking-[-0.05em] text-slate-900">
                {users.length}
              </div>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="mb-8 overflow-hidden p-0">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Technician recommendations</h2>
            </div>
            <div className="divide-y divide-slate-200">
              {recommendations.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-slate-500">
                  No pending recommendations right now.
                </div>
              ) : (
                recommendations.map((item) => (
                  <div
                    key={item.complaintId}
                    className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.complaintTitle}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Priority Score: {item.priorityScore} • {item.reason}
                      </p>
                      <p className="mt-1 text-sm text-blue-600">
                        Recommended: {item.recommendedTechnicianName}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      {!item.requiresSupervisorAction && item.recommendedTechnicianId && (
                        <button
                          onClick={() => approveRecommendation(item)}
                          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                          Approve recommendation
                        </button>
                      )}
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            assignComplaint(item.complaintId, e.target.value);
                          }
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
                      >
                        <option value="">Override technician</option>
                        {users.map((tech) => (
                          <option key={tech._id} value={tech._id}>
                            {tech.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Evaluation (safe version) */}
          {evaluation && (
            <Card className="mb-8 overflow-hidden p-0">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Priority-aware vs FCFS comparison
                </h2>
              </div>

              <div className="grid gap-4 p-5 md:grid-cols-3">
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
                    Priority-aware
                  </p>
                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    {evaluation?.priorityAware?.length || 0}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">Recommended items</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
                    FCFS
                  </p>
                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    {evaluation?.fcfs?.length || 0}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">Recommended items</p>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                    Pending
                  </p>
                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    {evaluation?.totalPending || 0}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">Total pending complaints</p>
                </div>
              </div>

              <div className="border-t border-slate-200 p-5">
                <p className="text-sm text-slate-600">
                  {evaluation?.summary?.note ||
                    'Priority-Aware orders by priorityScore. FCFS orders by submission time.'}
                </p>
              </div>
            </Card>
          )}

          {/* All complaints */}
          <Card className="overflow-hidden p-0">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-900">All complaints</h2>
            </div>
            <div className="divide-y divide-slate-200">
              {complaints.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-slate-500">
                  No complaints found.
                </div>
              ) : (
                complaints.map((complaint) => (
                  <div
                    key={complaint._id}
                    className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div>
                      <Link
                        to={`/complaint/${complaint._id}`}
                        className="text-sm font-semibold text-slate-900 hover:text-blue-600"
                      >
                        {complaint.title}
                      </Link>
                      <p className="mt-1 text-sm text-slate-500">
                        {complaint.reporter?.name || 'Unknown'} •{' '}
                        {complaint.location?.name || complaint.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge
                        label={getStatusLabel(complaint.status)}
                        type={getStatusBadgeType(complaint.status)}
                      />
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                        Score: {complaint.priorityScore ?? '-'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}