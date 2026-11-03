import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';

const stats = [
  { label: 'Open complaints', value: '128', trend: '+12% this month' },
  { label: 'Resolved today', value: '34', trend: '94% SLA compliance' },
  { label: 'Avg. response time', value: '4.2h', trend: 'Improved by 30 mins' },
  { label: 'Pending review', value: '17', trend: 'Needs action' },
];

const recentIssues = [
  { id: 'CM-2048', title: 'Broken ceiling light', location: 'Science Block', status: 'InProgress', priority: 'High' },
  { id: 'CM-2042', title: 'Water leak near cafeteria', location: 'Student Center', status: 'Pending', priority: 'Medium' },
  { id: 'CM-2035', title: 'Fire alarm battery replaced', location: 'Library Annex', status: 'Resolved', priority: 'Low' },
];

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">Operations overview</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Dashboard</h1>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} hover className="p-5">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
            </div>
            <p className="mt-3 text-xs font-medium text-blue-600">{stat.trend}</p>
          </Card>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent complaints</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {recentIssues.map((issue) => (
              <div key={issue.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{issue.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{issue.location}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge label={issue.status === 'InProgress' ? 'In Progress' : issue.status} type={issue.status === 'InProgress' ? 'InProgress' : issue.status} />
                  <StatusBadge label={issue.priority} type={issue.priority} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold text-slate-900">Priority summary</h2>
          <div className="mt-6 space-y-5">
            <div>
              <div className="mb-1 flex justify-between text-sm text-slate-600">
                <span>High priority</span>
                <span>42%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-200">
                <div className="h-2.5 w-[42%] rounded-full bg-red-500" />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm text-slate-600">
                <span>Medium priority</span>
                <span>38%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-200">
                <div className="h-2.5 w-[38%] rounded-full bg-amber-500" />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm text-slate-600">
                <span>Low priority</span>
                <span>20%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-200">
                <div className="h-2.5 w-[20%] rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
