import { getDashboardData } from '@/app/lib/dashboard-data';
import SummaryStats from '@/app/components/SummaryStats';
import ProjectCard from '@/app/components/ProjectCard';

export default function Dashboard() {
  const data = getDashboardData();

  if (!data || data.projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Data Available</h1>
          <p className="text-gray-600 mb-4">
            Generate your BuildPulse data to see your project dashboard.
          </p>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-left max-w-md">
            <h3 className="font-semibold text-gray-900 mb-2">Getting Started:</h3>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Set up your API tokens in <code className="bg-gray-100 px-1 rounded">.env</code></li>
              <li>2. Run <code className="bg-gray-100 px-1 rounded">npm run build-data</code></li>
              <li>3. Refresh this page to see your dashboard</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">⚡</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">BuildPulse</h1>
              <p className="text-gray-600">Personal project health tracker</p>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <SummaryStats data={data} />

        {/* Projects Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Projects ({data.projects.length})
            </h2>
            <div className="text-sm text-gray-500">
              Sorted by pulse score
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {data.projects.map((projectPulse, index) => (
              <ProjectCard
                key={`${projectPulse.project.name}-${index}`}
                projectPulse={projectPulse}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-8 mt-12">
          <div className="text-center text-gray-500 text-sm">
            <p>
              BuildPulse tracks your project health using GitHub commits and Toggl time entries.
            </p>
            <p className="mt-1">
              Data updates daily via CRON job. Last updated: {new Date(data.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
