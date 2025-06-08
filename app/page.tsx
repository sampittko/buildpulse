import { getDashboardData } from '@/app/lib/server-data';
import DashboardClient from '@/app/components/DashboardClient';

export default function Home() {
  const data = getDashboardData();

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DashboardClient initialData={data} />
      </div>
    </main>
  );
}
