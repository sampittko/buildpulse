import { DashboardData } from '@/app/lib/server-data';
import { ProjectOverviewChart } from './ProjectOverviewChart';

interface SummaryStatsProps {
  data: DashboardData;
}

export default function SummaryStats({ data }: SummaryStatsProps) {
  const { summary, lastUpdated, projects } = data;

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

  const getTrendEmoji = (status: string): string => {
    switch (status) {
      case 'improving':
        return '📈';
      case 'declining':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return '➡️';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8 shadow-sm dark:shadow-gray-900/10 transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Project Overview
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            3-month trend analysis • Last updated: {formatDate(lastUpdated)}
          </p>
        </div>
      </div>

      {/* Health Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-6">
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

      {/* Trend Analysis Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          3-Month Trend Analysis
        </h3>

        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 font-mono">
              {summary.improvingProjects}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center justify-center gap-1">
              {getTrendEmoji('improving')} Improving
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400 font-mono">
              {summary.stableProjects}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center justify-center gap-1">
              {getTrendEmoji('stable')} Stable
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400 font-mono">
              {summary.decliningProjects}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center justify-center gap-1">
              {getTrendEmoji('declining')} Declining
            </div>
          </div>
        </div>
      </div>

      {/* Project Targets Overview Chart */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          🎯 Project Targets vs Recent Performance
        </h3>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <ProjectOverviewChart projects={projects} height={250} />
          <div className="mt-4 text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Bars show recent average hours/week • Dashed lines show individual targets (8h each)
            </div>
          </div>
        </div>
      </div>

      {/* Repository Stats */}
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