import { ProjectPulse } from '@/app/lib/types';

interface ProjectCardProps {
  projectPulse: ProjectPulse;
}

function getHealthColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'slowing':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'dormant':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
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

export default function ProjectCard({ projectPulse }: ProjectCardProps) {
  const { project, weeklyCommits, weeklyHours, pulseScore, healthStatus } = projectPulse;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getHealthColor(healthStatus)}`}>
              {getHealthEmoji(healthStatus)}
              {healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1)}
            </span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{project.description}</p>
        </div>
        <div className="ml-4 text-right">
          <div className="text-2xl font-bold text-gray-900">{pulseScore.toFixed(1)}</div>
          <div className="text-xs text-gray-500 font-medium">PULSE SCORE</div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-blue-600">💻</span>
            <span className="text-sm font-medium text-blue-900">Commits</span>
          </div>
          <div className="text-lg font-semibold text-blue-900">{weeklyCommits}</div>
          <div className="text-xs text-blue-600">this week</div>
        </div>

        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-purple-600">⏱️</span>
            <span className="text-sm font-medium text-purple-900">Hours</span>
          </div>
          <div className="text-lg font-semibold text-purple-900">{weeklyHours.toFixed(1)}h</div>
          <div className="text-xs text-purple-600">this week</div>
        </div>
      </div>

      {/* Repository Info */}
      {project.githubRepo && project.githubRepo.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-500 mb-2">REPOSITORIES</div>
          <div className="flex flex-wrap gap-2">
            {project.githubRepo.map((repo, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono"
              >
                <span className="text-gray-500">📁</span>
                {repo}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          {project.startYear}
          {project.endYear ? ` - ${project.endYear}` : ' - Present'}
        </div>
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            View Project
            <span className="text-blue-500">↗</span>
          </a>
        )}
      </div>
    </div>
  );
} 