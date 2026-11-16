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

const metricConfig = [
  { key: 'averageWaitingTime', label: 'Average Waiting Time', suffix: ' min', lowerIsBetter: true },
  { key: 'criticalResponseTime', label: 'Critical Response Time', suffix: ' min', lowerIsBetter: true },
  { key: 'workloadBalance', label: 'Workload Balance', suffix: ' σ', lowerIsBetter: true },
  { key: 'assignmentSuitability', label: 'Assignment Suitability', suffix: '%', lowerIsBetter: false },
];

const getMethodSummary = (methodData = {}) =>
  metricConfig.map((metric) => ({
    label: metric.label,
    key: metric.key,
    value:
      metric.key === 'assignmentSuitability'
        ? `${formatNumber(methodData[metric.key] || 0, '')}%`
        : formatNumber(methodData[metric.key] || 0, metric.suffix),
    lowerIsBetter: metric.lowerIsBetter,
  }));

const getMetricValue = (methodData = {}, metricKey) => Number(methodData?.[metricKey] ?? 0);

const getMethodName = (methodId) => (methodId === 'priorityAware' ? 'Priority-Aware' : 'FCFS');

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
        accent: 'from-blue-600 via-blue-500 to-indigo-600',
        data: priorityAware,
      },
      {
        id: 'fcfs',
        title: 'FCFS',
        accent: 'from-slate-700 via-slate-600 to-slate-900',
        data: fcfs,
      },
    ];
  }, [evaluation]);

  const summary = evaluation?.summary || {};
  const improvements = summary.improvements || {};

  const comparisonMetrics = useMemo(() => {
    const priorityAware = evaluation?.priorityAware || {};
    const fcfs = evaluation?.fcfs || {};

    return metricConfig.map((metric) => {
      const priorityValue = getMetricValue(priorityAware, metric.key);
      const fcfsValue = getMetricValue(fcfs, metric.key);
      const maxValue = Math.max(Math.abs(priorityValue), Math.abs(fcfsValue), 1);
      const priorityPercent = maxValue ? (Math.abs(priorityValue) / maxValue) * 100 : 0;
      const fcfsPercent = maxValue ? (Math.abs(fcfsValue) / maxValue) * 100 : 0;
      const betterMethod = metric.lowerIsBetter
        ? priorityValue <= fcfsValue
          ? 'priorityAware'
          : 'fcfs'
        : priorityValue >= fcfsValue
          ? 'priorityAware'
          : 'fcfs';

      return {
        ...metric,
        priorityValue,
        fcfsValue,
        priorityPercent,
        fcfsPercent,
        betterMethod,
      };
    });
  }, [evaluation]);

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

  const hasComparisonData = useMemo(() => {
    const priorityAware = evaluation?.priorityAware || {};
    const fcfs = evaluation?.fcfs || {};

    const hasAssignments =
      (Array.isArray(priorityAware.assignments) && priorityAware.assignments.length > 0) ||
      (Array.isArray(fcfs.assignments) && fcfs.assignments.length > 0);

    const hasMetrics = [priorityAware, fcfs].some((methodData) =>
      Object.entries(methodData).some(([key, value]) => {
        if (key === 'assignments' || key === 'method') return false;
        const numericValue = Number(value);
        return Number.isFinite(numericValue) && numericValue > 0;
      })
    );

    return hasAssignments || hasMetrics;
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

  if (!hasComparisonData) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="border-slate-200 bg-white/90 p-10 text-center shadow-[0_20px_50px_rgba(15,23,42,0.04)]">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-2xl shadow-inner shadow-blue-100">
            📊
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">No data available</p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-slate-900">No pending work orders available for comparison.</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Submit and prioritize new complaints first.
          </p>
        </Card>
      </div>
    );
  }

  const performanceCards = [
    { key: 'waitingTimeReduction', label: 'Waiting Time Reduction' },
    { key: 'criticalResponseImprovement', label: 'Critical Response Improvement' },
    { key: 'workloadBalanceImprovement', label: 'Workload Balance Improvement' },
  ].filter((metric) => improvements[metric.key]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Supervisor analytics</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-slate-900">Scheduling Evaluation</h1>
          <p className="mt-2 text-sm text-slate-600">Priority-Aware vs First-Come-First-Served (FCFS) comparison</p>
        </div>
      </div>

      <Card className="mb-8 border-blue-200 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-6 shadow-[0_20px_60px_rgba(59,130,246,0.08)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">Winner</p>
            <div className="mt-3 inline-flex items-center rounded-full border border-blue-200 bg-white/90 px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] text-blue-700 shadow-sm">
              {summary?.betterMethod === 'Similar' ? 'Similar' : `Better Method: ${summary?.betterMethod || 'N/A'}`}
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              {summary?.betterMethod === 'Similar'
                ? 'The two scheduling models performed at a similar level for this workload profile.'
                : 'The priority-aware model reduces wait times and matches critical work to the best available technicians.'}
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
            {summary?.betterMethod === 'Similar' ? 'Balanced' : 'Recommended'}
          </span>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {methodCards.map((card) => {
          const metrics = getMethodSummary(card.data);

          return (
            <Card key={card.id} className="overflow-hidden border-slate-200 bg-white/90 p-0 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
              <div className={`bg-gradient-to-r ${card.accent} px-5 py-4`}>
                <h3 className="text-xl font-bold text-white">{card.title}</h3>
              </div>

              <div className="space-y-3 p-5">
                {metrics.map((metric) => {
                  const comparisonValue = comparisonMetrics.find((item) => item.key === metric.key);
                  const comparisonMethod = comparisonValue?.betterMethod;
                  const isBetter = comparisonMethod === card.id;

                  return (
                    <div
                      key={metric.label}
                      className={`flex items-center justify-between rounded-2xl border px-3.5 py-2.5 transition ${
                        isBetter
                          ? 'border-emerald-200 bg-emerald-50/80'
                          : 'border-slate-200 bg-slate-50/80'
                      }`}
                    >
                      <span className="text-sm font-medium text-slate-600">{metric.label}</span>
                      <span
                        className={`text-sm font-bold ${
                          isBetter ? 'text-emerald-700' : 'text-slate-900'
                        }`}
                      >
                        {metric.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8 p-6">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Comparison</p>
          <h3 className="mt-2 text-2xl font-bold tracking-[-0.05em] text-slate-900">Metric comparison bars</h3>
        </div>

        <div className="space-y-4">
          {comparisonMetrics.map((metric) => (
            <div key={metric.key} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-slate-700">{metric.label}</h4>
                <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {metric.betterMethod === 'priorityAware' ? 'Priority-Aware leads' : 'FCFS leads'}
                </span>
              </div>

              {['priorityAware', 'fcfs'].map((methodId) => {
                const methodData = methodId === 'priorityAware' ? metric.priorityValue : metric.fcfsValue;
                const percent = methodId === 'priorityAware' ? metric.priorityPercent : metric.fcfsPercent;
                const isWinner = methodId === metric.betterMethod;
                const label = getMethodName(methodId);

                return (
                  <div key={methodId} className="grid grid-cols-[120px_1fr_64px] items-center gap-3 py-1.5">
                    <span className="text-sm font-medium text-slate-600">{label}</span>
                    <div className="relative h-3 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full ${
                          methodId === 'priorityAware'
                            ? isWinner
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                              : 'bg-gradient-to-r from-blue-400 to-blue-300'
                            : isWinner
                              ? 'bg-gradient-to-r from-slate-700 to-slate-500'
                              : 'bg-gradient-to-r from-slate-400 to-slate-300'
                        }`}
                        style={{ width: `${Math.max(8, percent)}%` }}
                      />
                    </div>
                    <span className={`text-right text-sm font-semibold ${isWinner ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {metric.key === 'assignmentSuitability'
                        ? `${methodData.toFixed(1)}%`
                        : metric.key === 'workloadBalance'
                          ? `${methodData.toFixed(2)} σ`
                          : `${methodData.toFixed(2)}${metric.suffix}`}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-8 p-6">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Performance</p>
          <h3 className="mt-2 text-2xl font-bold tracking-[-0.05em] text-slate-900">Performance summary</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {performanceCards.length ? (
            performanceCards.map((metric) => (
              <div
                key={metric.key}
                className="rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-5 shadow-sm"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{metric.label}</p>
                <p className="mt-3 text-3xl font-bold tracking-[-0.06em] text-slate-900">{improvements[metric.key]}</p>
                <p className="mt-3 text-xs text-emerald-600">Improvement over baseline comparison</p>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500 md:col-span-3">
              No summary improvement data available for this workload yet.
            </div>
          )}
        </div>
      </Card>

      <Card className="mt-8 overflow-hidden p-0">
        <div className="border-b border-slate-200 px-5 py-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Assignments</p>
          <h3 className="mt-2 text-2xl font-bold tracking-[-0.05em] text-slate-900">Detailed comparison</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-semibold">Complaint</th>
                <th className="px-5 py-3 font-semibold">Priority-Aware</th>
                <th className="px-5 py-3 font-semibold">FCFS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {assignmentRows.length ? (
                assignmentRows.map((row, index) => (
                  <tr key={row.key} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                    <td className="px-5 py-4 font-medium text-slate-800">{row.complaintTitle}</td>
                    <td className="px-5 py-4 text-slate-700">{row.priorityAware}</td>
                    <td className="px-5 py-4 text-slate-700">{row.fcfs}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-5 py-8 text-center text-slate-500">
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
