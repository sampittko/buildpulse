import { getDashboardData } from '@/app/lib/server-data';
import DashboardClient from '@/app/components/DashboardClient';

export default function Home() {
  const data = getDashboardData();

  return (
    <main className="min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              BuildPulse
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
              Track the pulse of your personal projects
            </p>
          </div>
        </div>

        <DashboardClient initialData={data} />
      </div>
    </main>
  );
}
