import { startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { ProjectHealth, Project, GitHubCommit, TogglTimeEntry } from './types';

export type { ProjectHealth } from './types';

export function getCurrentWeekBounds(): { start: Date; end: Date } {
  const now = new Date();
  // Week starts on Saturday (6 in date-fns, where Sunday is 0)
  const start = startOfWeek(now, { weekStartsOn: 6 });
  const end = endOfWeek(now, { weekStartsOn: 6 });

  return { start, end };
}

export function calculateProjectHealth(
  project: Project,
  commits: GitHubCommit[],
  timeEntries: TogglTimeEntry[]
): ProjectHealth {
  const { start, end } = getCurrentWeekBounds();

  // Filter commits for current week
  const weekCommits = commits.filter(commit => {
    const commitDate = new Date(commit.commit.author.date);
    return isWithinInterval(commitDate, { start, end });
  });

  // Calculate total hours from time entries
  const totalSeconds = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
  const weeklyHours = totalSeconds / 3600; // Convert to hours

  // Calculate health score (0-100)
  const timeScore = Math.min((weeklyHours / project.targetWeeklyHours) * 60, 60);
  const commitScore = Math.min(weekCommits.length * 10, 40); // Max 40 points for commits
  const healthScore = Math.round(timeScore + commitScore);

  // Determine status
  let status: ProjectHealth['status'];
  if (healthScore >= 80) status = 'excellent';
  else if (healthScore >= 60) status = 'good';
  else if (healthScore >= 40) status = 'warning';
  else status = 'critical';

  return {
    project,
    weeklyHours,
    targetHours: project.targetWeeklyHours,
    commits: weekCommits.length,
    healthScore,
    status
  };
}

export function formatHours(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  }
  return `${hours.toFixed(1)}h`;
} 