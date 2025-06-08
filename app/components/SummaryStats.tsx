import { DashboardData } from '@/app/lib/server-data';

interface SummaryStatsProps {
  data: DashboardData;
}

export default function SummaryStats({ data }: SummaryStatsProps) {
  const { summary, lastUpdated } = data;

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">BuildPulse Dashboard</h2>
          <p className="text-gray-600 text-sm mt-1">
            Track the pulse of your personal projects
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1">LAST UPDATED</div>
          <div className="text-sm font-medium text-gray-900">
            {formatDate(lastUpdated)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {/* Total Projects */}
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {summary.totalProjects}
          </div>
          <div className="text-sm text-gray-600">All Projects</div>
        </div>

        {/* Active Projects */}
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-900 mb-1">
            🟢 {summary.activeProjects}
          </div>
          <div className="text-sm text-green-700">Active</div>
        </div>

        {/* Slowing Projects */}
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-900 mb-1">
            🟡 {summary.slowingProjects}
          </div>
          <div className="text-sm text-yellow-700">Slowing</div>
        </div>

        {/* Dormant Projects */}
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-900 mb-1">
            🔴 {summary.dormantProjects}
          </div>
          <div className="text-sm text-red-700">Dormant</div>
        </div>

        {/* Weekly Stats */}
        <div className="bg-indigo-50 rounded-lg p-4 text-center">
          <div className="text-lg font-bold text-indigo-900 mb-1">
            {summary.totalWeeklyCommits} / {summary.totalWeeklyHours.toFixed(1)}h
          </div>
          <div className="text-sm text-indigo-700">Commits / Hours</div>
        </div>

        {/* Repository Stats */}
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-lg font-bold text-purple-900 mb-1">
            {summary.publicProjects} / {summary.privateProjects}
          </div>
          <div className="text-sm text-purple-700">Public / Private Repos</div>
        </div>
      </div>

      {/* Health Distribution Bar */}
      <div className="mt-6">
        <div className="text-sm font-medium text-gray-700 mb-2">Project Health Distribution</div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div className="flex h-full">
            {summary.activeProjects > 0 && (
              <div
                className="bg-green-500"
                style={{
                  width: `${(summary.activeProjects / summary.totalProjects) * 100}%`,
                }}
              />
            )}
            {summary.slowingProjects > 0 && (
              <div
                className="bg-yellow-500"
                style={{
                  width: `${(summary.slowingProjects / summary.totalProjects) * 100}%`,
                }}
              />
            )}
            {summary.dormantProjects > 0 && (
              <div
                className="bg-red-500"
                style={{
                  width: `${(summary.dormantProjects / summary.totalProjects) * 100}%`,
                }}
              />
            )}
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Healthy Projects</span>
          <span>Projects Need Attention</span>
        </div>
      </div>
    </div>
  );
} 