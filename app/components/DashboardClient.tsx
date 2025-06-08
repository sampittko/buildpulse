'use client';

import { DashboardData } from '@/app/lib/server-data';
import ProjectCard from './ProjectCard';
import SummaryStats from './SummaryStats';

interface DashboardClientProps {
  initialData: DashboardData;
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  return (
    <>
      <SummaryStats data={initialData} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {initialData.projects.map((pulse, index) => (
          <ProjectCard
            key={index}
            pulse={pulse}
          />
        ))}
      </div>
    </>
  );
} 