import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';

const statusOptions = ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'];

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

      setUsers((data.users || []).filter((person) => person.role === 'technician'));
    } catch (err) {
      setError(err.message || 'Failed to load technician list.');
    }
  };

  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      setLoading(true);
      setError('');
      await Promise.all([fetchComplaints(), fetchUsers()]);
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
        prev.map((item) => (item._id === complaintId ? { ...item, assignedTo: data.complaint.assignedTo, status: 'Assigned' } : item))
      );
    } catch (err) {
      setError(err.message || 'Failed to assign complaint.');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="p-8 text-center text-sm text-slate-600">Loading dashboard...</Card>
      </div>
    );
  }

  const reporterComplaints = complaints.filter((item) => item.reporter?._id === user?._id || item.reporter === user?._id);
  const assignedComplaints = complaints.filter((item) => item.assignedTo?._id === user?._id || item.assignedTo === user?._id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">Operations overview</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Dashboard</h1>
        </div>
        {role === 'reporter' && (
          <Link to="/submit-complaint" className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
            Submit new complaint
          </Link>
        )}
      </div>

      {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {role === 'reporter' && (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <Card hover className="p-5">
              <p className="text-sm text-slate-500">Your complaints</p>
              <div className="mt-4 text-3xl font-bold text-slate-900">{reporterComplaints.length}</div>
            </Card>
            <Card hover className="p-5">
              <p className="text-sm text-slate-500">Open</p>
              <div className="mt-4 text-3xl font-bold text-slate-900">
                {reporterComplaints.filter((item) => !['Resolved', 'Closed'].includes(item.status)).length}
              </div>
            </Card>
            <Card hover className="p-5">
              <p className="text-sm text-slate-500">Resolved</p>
              <div className="mt-4 text-3xl font-bold text-slate-900">
                {reporterComplaints.filter((item) => item.status === 'Resolved').length}
              </div>
            </Card>
          </div>

          <Card className="mt-8 overflow-hidden p-0">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Recent complaints</h2>
            </div>
            <div className="divide-y divide-slate-200">
              {reporterComplaints.slice(0, 5).map((complaint) => (
                <div key={complaint._id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <Link to={`/complaint/${complaint._id}`} className="text-sm font-semibold text-slate-900 hover:text-blue-600">
                      {complaint.title}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">{complaint.location?.name || complaint.location}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge label={getStatusLabel(complaint.status)} type={getStatusBadgeType(complaint.status)} />
                    <StatusBadge label={complaint.priority} type={complaint.priority} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {role === 'technician' && (
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Assigned complaints</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {assignedComplaints.map((complaint) => (
              <div key={complaint._id} className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <Link to={`/complaint/${complaint._id}`} className="text-sm font-semibold text-slate-900 hover:text-blue-600">
                    {complaint.title}
                  </Link>
                  <p className="mt-1 text-sm text-slate-500">{complaint.location?.name || complaint.location}</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <StatusBadge label={getStatusLabel(complaint.status)} type={getStatusBadgeType(complaint.status)} />
                  <select
                    value={complaint.status}
                    onChange={(event) => updateComplaintStatus(complaint._id, event.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {(role === 'supervisor' || role === 'admin') && (
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">All complaints</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {complaints.map((complaint) => (
              <div key={complaint._id} className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <Link to={`/complaint/${complaint._id}`} className="text-sm font-semibold text-slate-900 hover:text-blue-600">
                    {complaint.title}
                  </Link>
                  <p className="mt-1 text-sm text-slate-500">
                    {complaint.reporter?.name || 'Unknown reporter'} • {complaint.location?.name || complaint.location}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <StatusBadge label={getStatusLabel(complaint.status)} type={getStatusBadgeType(complaint.status)} />
                  <select
                    value={complaint.assignedTo?._id || ''}
                    onChange={(event) => assignComplaint(complaint._id, event.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Unassigned</option>
                    {users.map((person) => (
                      <option key={person._id} value={person._id}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
