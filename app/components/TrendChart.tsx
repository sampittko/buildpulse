'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { WeeklyData } from '@/app/lib/types';

interface TrendChartProps {
  weeklyData: WeeklyData[];
  targetWeeklyHours: number;
  showCommits?: boolean;
  showHours?: boolean;
  height?: number;
}

export function TrendChart({
  weeklyData,
  targetWeeklyHours,
  showCommits = true,
  showHours = true,
  height = 200
}: TrendChartProps) {
  // Format data for the chart
  const chartData = weeklyData.map(week => ({
    week: formatWeekLabel(week.weekStart),
    commits: week.commits,
    hours: week.hours,
    target: targetWeeklyHours
  }));

  const formatWeekLabel = (weekStart: string): string => {
    const date = new Date(weekStart);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Week of {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name === 'commits' && `Commits: ${entry.value}`}
              {entry.name === 'hours' && `Hours: ${entry.value.toFixed(1)}h`}
              {entry.name === 'target' && `Target: ${entry.value}h`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 12 }}
            stroke="currentColor"
            opacity={0.6}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="currentColor"
            opacity={0.6}
          />

          {/* Target line for hours */}
          {showHours && targetWeeklyHours > 0 && (
            <ReferenceLine
              y={targetWeeklyHours}
              stroke="rgb(156, 163, 175)"
              strokeDasharray="5 5"
              strokeWidth={2}
            />
          )}

          <Tooltip content={<CustomTooltip />} />

          {showCommits && (
            <Line
              type="monotone"
              dataKey="commits"
              stroke="rgb(59, 130, 246)"
              strokeWidth={2}
              dot={{ r: 4, fill: 'rgb(59, 130, 246)' }}
              activeDot={{ r: 6, fill: 'rgb(59, 130, 246)' }}
              name="commits"
            />
          )}

          {showHours && (
            <Line
              type="monotone"
              dataKey="hours"
              stroke="rgb(16, 185, 129)"
              strokeWidth={2}
              dot={{ r: 4, fill: 'rgb(16, 185, 129)' }}
              activeDot={{ r: 6, fill: 'rgb(16, 185, 129)' }}
              name="hours"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 