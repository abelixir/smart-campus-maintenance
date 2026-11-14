import { useEffect, useMemo, useState } from 'react';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

const formatNumber = (value, suffix = '') => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return `N/A${suffix}`;
  }

  return `${parsed.toFixed(2)}${suffix}`;
};

const getMethodSummary = (methodData = {}) => [
  { label: 'Average Waiting Time', value: formatNumber(methodData.averageWaitingTime || 0, ' min') },
  { label: 'Critical Response Time', value: formatNumber(methodData.criticalResponseTime || 0, ' min') },
  { label: 'Workload Balance', value: formatNumber(methodData.workloadBalance || 0, ' σ') },
  { label: 'Assignment Suitability', value: `${formatNumber(methodData.assignmentSuitability || 0, '')}%` },
  { label: 'Unassigned Work Orders', value: Number(methodData.unassignedCount || 0) },
  { label: 'Execution Time', value: `${Number(methodData.executionTimeMs || 0)} ms` },
];

export default function Evaluation() {
  const { user, token } = useAuth();
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !['supervisor', 'admin'].includes(user?.role)) {
      return;
    }

    const loadEvaluation = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('http://localhost:5000/api/complaints/evaluation', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || 'Unable to load scheduling evaluation.');
        }

        setEvaluation(data || {});
      } catch (err) {
        setError(err.message || 'Failed to load evaluation results.');
      } finally {
        setLoading(false);
      }
    };

    loadEvaluation();
  }, [token, user?.role]);

  const methodCards = useMemo(() => {
    const priorityAware = evaluation?.priorityAware || {};
    const fcfs = evaluation?.fcfs || {};

    return [
      {
        id: 'priorityAware',
        title: 'Priority-Aware',
        accent: 'from-blue-500 to-indigo-600',
        data: priorityAware,
      },
      {
        id: 'fcfs',
        title: 'FCFS',
        accent: 'from-slate-700 to-slate-900',
        data: fcfs,
      },
    ];
  }, [evaluation]);

  const summary = evaluation?.summary || {};
  const improvements = summary.improvements || {};

  const assignmentRows = useMemo(() => {
    const priorityAwareAssignments = Array.isArray(evaluation?.priorityAware?.assignments)
      ? evaluation.priorityAware.assignments
      : [];
    const fcfsAssignments = Array.isArray(evaluation?.fcfs?.assignments)
      ? evaluation.fcfs.assignments
      : [];

    const rows = new Map();

    priorityAwareAssignments.forEach((assignment) => {
      const key = assignment?.complaintId || assignment?.complaintTitle || 'unknown';
      rows.set(key, {
        key,
        complaintTitle: assignment?.complaintTitle || 'Untitled complaint',
        priorityAware: assignment?.recommendedTechnicianName || 'Unassigned',
        fcfs: '—',
      });
    });

    fcfsAssignments.forEach((assignment) => {
      const key = assignment?.complaintId || assignment?.complaintTitle || 'unknown';
      const row = rows.get(key) || {
        key,
        complaintTitle: assignment?.complaintTitle || 'Untitled complaint',
        priorityAware: '—',
        fcfs: '—',
      };

      row.fcfs = assignment?.recommendedTechnicianName || 'Unassigned';
      rows.set(key, row);
    });

    return Array.from(rows.values());
  }, [evaluation]);

  if (!['supervisor', 'admin'].includes(user?.role)) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="p-10 text-center">
          <h1 className="text-2xl font-bold tracking-[-0.04em] text-slate-900">Access denied</h1>
          <p className="mt-2 text-sm text-slate-600">This evaluation dashboard is only available to supervisors and administrators.</p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="p-10 text-center text-sm text-slate-600">
          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-blue-100" />
          Loading scheduling evaluation...
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="border-red-200 bg-red-50 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-600">Evaluation error</p>
          <h1 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-slate-900">Unable to load scheduling data</h1>
          <p className="mt-2 text-sm text-slate-700">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Supervisor analytics</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-slate-900">Scheduling Evaluation</h1>
          <p className="mt-2 text-sm text-slate-600">Priority-Aware vs First-Come-First-Served (FCFS) Comparison</p>
        </div>
      </div>

      <Card className="mb-8 border-blue-200 bg-gradient-to-r from-blue-50 via-white to-indigo-50">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Winner</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.05em] text-slate-900">
              {summary?.betterMethod === 'Similar' ? 'Similar overall performance' : `Better Method: ${summary?.betterMethod || 'N/A'}`}
            </h2>
          </div>
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
            {summary?.betterMethod === 'Similar' ? 'Balanced' : 'Recommended'}
          </span>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {methodCards.map((card) => {
          const metrics = getMethodSummary(card.data);

          return (
            <Card key={card.id} className="overflow-hidden border-slate-200 bg-white p-0">
              <div className={`bg-gradient-to-r ${card.accent} px-5 py-4`}>
                <h3 className="text-xl font-bold text-white">{card.title}</h3>
              </div>

              <div className="space-y-3 p-5">
                {metrics.map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <span className="text-sm font-medium text-slate-600">{metric.label}</span>
                    <span className="text-sm font-bold text-slate-900">{metric.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Improvements</p>
            <h3 className="mt-2 text-2xl font-bold tracking-[-0.05em] text-slate-900">Performance delta</h3>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Waiting Time Reduction</p>
            <p className="mt-3 text-lg font-bold text-slate-900">{improvements.waitingTimeReduction || 'N/A'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Critical Response Improvement</p>
            <p className="mt-3 text-lg font-bold text-slate-900">{improvements.criticalResponseImprovement || 'N/A'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Workload Balance Improvement</p>
            <p className="mt-3 text-lg font-bold text-slate-900">{improvements.workloadBalanceImprovement || 'N/A'}</p>
          </div>
        </div>
      </Card>

      <Card className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Assignments</p>
            <h3 className="mt-2 text-2xl font-bold tracking-[-0.05em] text-slate-900">Detailed comparison</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="px-3 py-3 font-semibold">Complaint</th>
                <th className="px-3 py-3 font-semibold">Priority-Aware</th>
                <th className="px-3 py-3 font-semibold">FCFS</th>
              </tr>
            </thead>
            <tbody>
              {assignmentRows.length ? (
                assignmentRows.map((row) => (
                  <tr key={row.key} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-3 py-3 font-medium text-slate-800">{row.complaintTitle}</td>
                    <td className="px-3 py-3 text-slate-700">{row.priorityAware}</td>
                    <td className="px-3 py-3 text-slate-700">{row.fcfs}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-3 py-6 text-center text-slate-500">
                    No assignment data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
