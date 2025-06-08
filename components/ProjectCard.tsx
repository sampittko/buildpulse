import { ProjectPulse } from '@/app/lib/types';
import { TrendChart } from '@/app/components/TrendChart';

interface ProjectCardProps {
  projectPulse: ProjectPulse;
}

export function ProjectCard({ projectPulse }: ProjectCardProps) {
  const { project, weeklyCommits, weeklyHours, pulseScore, healthStatus, trendStatus, commitTrend, hoursTrend, hoursTarget, hoursProgress } = projectPulse;

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'slowing': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'dormant': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const getTrendColor = (status: string) => {
    switch (status) {
      case 'improving': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'stable': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
      case 'declining': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getTrendTextColor = (direction: string) => {
    switch (direction) {
      case 'increasing': return 'text-green-600 dark:text-green-400';
      case 'decreasing': return 'text-red-600 dark:text-red-400';
      case 'stable': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'text-green-600 dark:text-green-400';
    if (progress >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getProgressBarColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {project.name}
            </h3>
            <div className="flex gap-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getHealthColor(healthStatus)}`}>
                {healthStatus}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getTrendColor(trendStatus)}`}>
                {trendStatus}
              </span>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Week Stats */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-2">
            Current Week Stats
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Commits</span>
              <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                {weeklyCommits}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Hours</span>
              <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                {weeklyHours.toFixed(1)}h
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pulse Score</span>
              <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                {pulseScore.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Target Hours Progress */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-2">
            🎯 Weekly Target: {hoursTarget}h
          </h4>
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Recent Average</span>
                <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                  {hoursTrend.recent.toFixed(1)}h
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Target Progress</span>
                  <span className={`font-mono text-sm font-medium ${getProgressColor(hoursProgress)}`}>
                    {Math.min(hoursProgress, 999).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(hoursProgress)}`}
                    style={{ width: `${Math.min(hoursProgress, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {hoursProgress >= 100 ? 'Target exceeded! 🎉' :
                    hoursProgress >= 70 ? 'Close to target' :
                      'Needs more focus'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Month Trends with Charts */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          📈 3-Month Activity Trends
        </h4>

        {/* Trend Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Commits</span>
              <span className="text-lg">{getTrendIcon(commitTrend.direction)}</span>
            </div>
            <div className="space-y-1">
              <div className={`text-sm font-medium ${getTrendTextColor(commitTrend.direction)}`}>
                {commitTrend.changePercentage > 0 ? '+' : ''}{commitTrend.changePercentage.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {commitTrend.recent.toFixed(1)} avg/week
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hours</span>
              <span className="text-lg">{getTrendIcon(hoursTrend.direction)}</span>
            </div>
            <div className="space-y-1">
              <div className={`text-sm font-medium ${getTrendTextColor(hoursTrend.direction)}`}>
                {hoursTrend.changePercentage > 0 ? '+' : ''}{hoursTrend.changePercentage.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {hoursTrend.recent.toFixed(1)}h avg/week
              </div>
            </div>
          </div>
        </div>

        {/* Trend Charts */}
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              📊 Hours vs Target (gray dashed line = {hoursTarget}h target)
            </h5>
            <TrendChart
              weeklyData={projectPulse.weeklyData}
              targetWeeklyHours={hoursTarget}
              showCommits={false}
              showHours={true}
              height={180}
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              💻 Commit Activity
            </h5>
            <TrendChart
              weeklyData={projectPulse.weeklyData}
              targetWeeklyHours={0}
              showCommits={true}
              showHours={false}
              height={180}
            />
          </div>
        </div>
      </div>

      {project.url && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm underline"
          >
            View Project →
          </a>
        </div>
      )}
    </div>
  );
} 