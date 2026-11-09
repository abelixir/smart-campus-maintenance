import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const roleOptions = ['reporter', 'technician', 'supervisor', 'admin'];

const initialFormState = {
  name: '',
  email: '',
  password: '',
  role: 'reporter',
};

export default function Admin() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({ totals: {}, statusCounts: [], categoryCounts: [] });
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialFormState);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [statsResponse, usersResponse, complaintsResponse] = await Promise.all([
        fetch('http://localhost:5000/api/admin/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch('http://localhost:5000/api/admin/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch('http://localhost:5000/api/complaints', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const statsData = await statsResponse.json();
      const usersData = await usersResponse.json();
      const complaintsData = await complaintsResponse.json();

      if (!statsResponse.ok || !usersResponse.ok || !complaintsResponse.ok) {
        throw new Error(
          statsData?.message || usersData?.message || complaintsData?.message || 'Unable to load admin data.'
        );
      }

      setStats(statsData);
      setUsers(usersData.users || []);
      setComplaints(complaintsData.complaints || []);
    } catch (err) {
      setError(err.message || 'Something went wrong while loading admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin' && token) {
      fetchData();
    }
  }, [user, token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setSubmitLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to create user.');
      }

      setUsers((prev) => [
        {
          _id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        },
        ...prev,
      ]);
      setForm(initialFormState);
    } catch (err) {
      setError(err.message || 'Unable to create user.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleRoleChange = async (userId, nextRole) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: nextRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to update user role.');
      }

      setUsers((prev) =>
        prev.map((item) => (item._id === userId ? { ...item, role: nextRole } : item))
      );
    } catch (err) {
      setError(err.message || 'Unable to update user role.');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="p-10 text-center">
          <h1 className="text-2xl font-bold tracking-[-0.04em] text-slate-900">Access denied</h1>
          <p className="mt-2 text-sm text-slate-600">This section is only available to administrators.</p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="p-10 text-center text-sm text-slate-600">
          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-blue-100" />
          Loading admin panel...
        </Card>
      </div>
    );
  }

  const totalSummaryCards = [
    { label: 'Total complaints', value: stats.totals?.totalComplaints || 0 },
    { label: 'Resolved', value: stats.totals?.resolvedComplaints || 0 },
    { label: 'Pending', value: stats.totals?.pendingComplaints || 0 },
    { label: 'Users', value: stats.totals?.totalUsers || users.length },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-[30px] border border-slate-200 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)] backdrop-blur-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">Administration</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-900">Admin dashboard</h1>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {totalSummaryCards.map((item) => (
          <Card key={item.label} hover className="p-5">
            <p className="text-sm text-slate-500">{item.label}</p>
            <div className="mt-4 text-3xl font-bold tracking-[-0.05em] text-slate-900">{item.value}</div>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-slate-900">Complaint status overview</h2>
          <div className="mt-5 space-y-4">
            {(stats.statusCounts || []).map((item) => (
              <div key={item._id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span className="text-sm text-slate-600">{item._id}</span>
                <span className="text-sm font-semibold text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold text-slate-900">Category breakdown</h2>
          <div className="mt-5 space-y-4">
            {(stats.categoryCounts || []).map((item) => (
              <div key={item._id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span className="text-sm text-slate-600">{item._id}</span>
                <span className="text-sm font-semibold text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-8 overflow-hidden p-0">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">All system complaints</h2>
        </div>

        <div className="divide-y divide-slate-200">
          {complaints.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500">No complaints have been submitted yet.</div>
          ) : (
            complaints.map((complaint) => (
              <div key={complaint._id} className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{complaint.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {complaint.reporter?.name || 'Unknown reporter'} • {complaint.location?.name || complaint.location}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {complaint.status}
                  </span>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                    {complaint.priority || 'Medium'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="mt-8 p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">Create new user</h2>
        </div>

        <form onSubmit={handleCreateUser} className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.75 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              placeholder="Jane Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.75 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              placeholder="jane@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.75 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              placeholder="Enter password"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="block text-sm font-medium text-slate-700">Role</label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.75 text-sm text-slate-800 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" className="min-w-40" disabled={submitLoading}>
              {submitLoading ? 'Creating user...' : 'Create user'}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="mt-8 overflow-hidden p-0">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">User directory</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((person) => (
                <tr key={person._id} className="bg-white">
                  <td className="px-5 py-4 font-medium text-slate-800">{person.name}</td>
                  <td className="px-5 py-4 text-slate-600">{person.email}</td>
                  <td className="px-5 py-4">
                    <select
                      value={person.role}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
                      onChange={(event) => handleRoleChange(person._id, event.target.value)}
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <Button type="button" variant="secondary" size="sm" onClick={() => handleRoleChange(person._id, person.role)}>
                      Save
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
