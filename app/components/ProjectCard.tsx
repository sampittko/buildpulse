import { ProjectPulse } from '@/app/lib/types';

interface ProjectCardProps {
  pulse: ProjectPulse;
}

function getHealthColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
    case 'slowing':
      return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
    case 'dormant':
      return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
    default:
      return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
  }
}

function getHealthEmoji(status: string): string {
  switch (status) {
    case 'active':
      return '🟢';
    case 'slowing':
      return '🟡';
    case 'dormant':
      return '🔴';
    default:
      return '⚪';
  }
}

export default function ProjectCard({ pulse }: ProjectCardProps) {
  const { project, weeklyCommits, weeklyHours, pulseScore, healthStatus } = pulse;

  const formatTags = (tags: string[]) => {
    return tags.join(', ');
  };

  const renderRepositories = () => {
    const publicRepos = project.githubRepo || [];
    const privateRepos = project.githubRepoPrivate || [];

    return (
      <div className="space-y-1">
        {publicRepos.map((repo, index) => (
          <div key={`public-${index}`} className="flex items-center gap-2 text-sm">
            <span className="text-green-600 dark:text-green-400">📁</span>
            <span className="font-mono text-gray-600 dark:text-gray-400">{repo}</span>
          </div>
        ))}
        {privateRepos.map((repo, index) => (
          <div key={`private-${index}`} className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">🔒</span>
            <span className="font-mono text-gray-500 dark:text-gray-500">Private Repo</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-gray-900/20 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
            {project.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {project.description}
          </p>
        </div>
        <div className={`px-3 py-1.5 rounded-full border text-sm font-medium ${getHealthColor(healthStatus)}`}>
          {getHealthEmoji(healthStatus)} {healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1)}
        </div>
      </div>

      {/* Repositories */}
      {(project.githubRepo?.length || project.githubRepoPrivate?.length) && (
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Repositories
          </div>
          {renderRepositories()}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold font-mono text-gray-900 dark:text-gray-100">
            {weeklyCommits}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Commits
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold font-mono text-gray-900 dark:text-gray-100">
            {weeklyHours.toFixed(1)}h
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Hours
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
            {pulseScore.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Pulse Score
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div>
            <span className="font-medium">{project.startYear}</span>
            {project.endYear && project.endYear !== project.startYear && (
              <span> - {project.endYear}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium">
              {formatTags(project.tags)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 