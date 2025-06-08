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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8 shadow-sm dark:shadow-gray-900/10 transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Project Overview
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Last updated: {formatDate(lastUpdated)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-mono">
            {summary.totalProjects}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Total Projects
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 font-mono">
            {summary.activeProjects}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            🟢 Active
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 font-mono">
            {summary.slowingProjects}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            🟡 Slowing
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 font-mono">
            {summary.dormantProjects}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            🔴 Dormant
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
            {summary.totalWeeklyCommits}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            💻 Commits
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 font-mono">
            {summary.totalWeeklyHours.toFixed(1)}h
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            ⏱️ Hours
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">📁 Repositories:</span>
            <span className="font-mono font-medium text-gray-900 dark:text-gray-100">
              {summary.publicProjects} public, {summary.privateProjects} private
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 