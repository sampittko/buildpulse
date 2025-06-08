'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ProjectPulse } from '@/app/lib/types';

interface ProjectOverviewChartProps {
  projects: ProjectPulse[];
  height?: number;
}

export function ProjectOverviewChart({ projects, height = 300 }: ProjectOverviewChartProps) {
  // Format data for the chart
  const chartData = projects.map(project => ({
    name: project.project.name.length > 15 ?
      project.project.name.substring(0, 15) + '...' :
      project.project.name,
    fullName: project.project.name,
    actualHours: project.hoursTrend.recent,
    targetHours: project.hoursTarget,
    progress: Math.min(project.hoursProgress, 150), // Cap at 150% for display
    status: project.healthStatus
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {data.fullName}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Recent: {data.actualHours.toFixed(1)}h/week
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Target: {data.targetHours}h/week
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">
            Progress: {data.progress.toFixed(0)}%
          </p>
          <p className="text-sm capitalize">
            Status: {data.status}
          </p>
        </div>
      );
    }
    return null;
  };

  const getBarColor = (status: string): string => {
    switch (status) {
      case 'active': return 'rgb(34, 197, 94)'; // green-500
      case 'slowing': return 'rgb(234, 179, 8)'; // yellow-500
      case 'dormant': return 'rgb(239, 68, 68)'; // red-500
      default: return 'rgb(156, 163, 175)'; // gray-400
    }
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            stroke="currentColor"
            opacity={0.6}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="currentColor"
            opacity={0.6}
            label={{ value: 'Hours/Week', angle: -90, position: 'insideLeft' }}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Actual hours bars */}
          <Bar
            dataKey="actualHours"
            fill="rgb(59, 130, 246)"
            radius={[4, 4, 0, 0]}
            name="Recent Hours"
          />

          {/* Target reference lines - we'll add these as individual reference lines */}
          {chartData.map((project, index) => (
            <ReferenceLine
              key={`target-${index}`}
              y={project.targetHours}
              stroke="rgb(156, 163, 175)"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 