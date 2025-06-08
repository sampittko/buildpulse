import fs from 'fs';
import path from 'path';
import { Project, HealthStatus, PulseScoreConfig, ProjectPulse, WeeklyData, TrendData } from './types';
import { calculateTrend, calculateTrendBasedPulseScore, getTrendStatus } from './trend-analysis';

// Enhanced pulse score configuration with trend weights
const DEFAULT_PULSE_CONFIG: PulseScoreConfig = {
  commitWeight: 1.5,
  hoursWeight: 2,
  activeThreshold: 8, // Lowered slightly since we're using trend data
  slowingThreshold: 4, // Lowered slightly since we're using trend data
  // New trend-based weights
  recentWeight: 0.5, // Recent activity weighted highest
  mediumWeight: 0.3, // Medium term activity 
  longerWeight: 0.2, // Longer term activity weighted lowest
  trendWeight: 0.2, // Trend direction bonus/penalty
};

/**
 * Load projects from the JSON file
 */
export function loadProjects(): Project[] {
  try {
    const projectsPath = path.join(process.cwd(), 'data', 'projects.json');
    const projectsData = fs.readFileSync(projectsPath, 'utf8');
    return JSON.parse(projectsData) as Project[];
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
}

/**
 * Calculate pulse score based on commits and hours (legacy version for compatibility)
 */
export function calculatePulseScore(
  weeklyCommits: number,
  weeklyHours: number,
  config: PulseScoreConfig = DEFAULT_PULSE_CONFIG
): number {
  return (weeklyCommits * config.commitWeight) + (weeklyHours * config.hoursWeight);
}

/**
 * Calculate enhanced pulse score with trend analysis
 */
export function calculateEnhancedPulseScore(
  weeklyData: WeeklyData[],
  config: PulseScoreConfig = DEFAULT_PULSE_CONFIG
): {
  pulseScore: number;
  trendScore: number;
  commitTrend: TrendData;
  hoursTrend: TrendData;
  weeklyCommits: number;
  weeklyHours: number;
} {
  // Calculate trends
  const commitTrend = calculateTrend(weeklyData, 'commits');
  const hoursTrend = calculateTrend(weeklyData, 'hours');

  // Calculate trend-based pulse score
  const { pulseScore, trendScore } = calculateTrendBasedPulseScore(
    commitTrend,
    hoursTrend,
    config
  );

  // Get current week data for backward compatibility
  const currentWeek = weeklyData.length > 0 ? weeklyData[weeklyData.length - 1] : null;
  const weeklyCommits = currentWeek?.commits || 0;
  const weeklyHours = currentWeek?.hours || 0;

  return {
    pulseScore,
    trendScore,
    commitTrend,
    hoursTrend,
    weeklyCommits,
    weeklyHours
  };
}

/**
 * Determine health status based on enhanced pulse score and trends
 */
export function getEnhancedHealthStatus(
  pulseScore: number,
  commitTrend: TrendData,
  hoursTrend: TrendData,
  config: PulseScoreConfig = DEFAULT_PULSE_CONFIG
): HealthStatus {
  // Base health status from pulse score
  let baseHealth: HealthStatus;
  if (pulseScore >= config.activeThreshold) {
    baseHealth = 'active';
  } else if (pulseScore >= config.slowingThreshold) {
    baseHealth = 'slowing';
  } else {
    baseHealth = 'dormant';
  }

  // Adjust based on trends
  const trendStatus = getTrendStatus(commitTrend, hoursTrend);

  // If trending up strongly, bump up health status
  if (trendStatus === 'improving' && (commitTrend.changePercentage > 25 || hoursTrend.changePercentage > 25)) {
    if (baseHealth === 'dormant') return 'slowing';
    if (baseHealth === 'slowing') return 'active';
  }

  // If trending down strongly, bump down health status
  if (trendStatus === 'declining' && (commitTrend.changePercentage < -25 || hoursTrend.changePercentage < -25)) {
    if (baseHealth === 'active') return 'slowing';
    if (baseHealth === 'slowing') return 'dormant';
  }

  return baseHealth;
}

/**
 * Determine health status based on pulse score (legacy version)
 */
export function getHealthStatus(
  pulseScore: number,
  config: PulseScoreConfig = DEFAULT_PULSE_CONFIG
): HealthStatus {
  if (pulseScore >= config.activeThreshold) {
    return 'active';
  } else if (pulseScore >= config.slowingThreshold) {
    return 'slowing';
  } else {
    return 'dormant';
  }
}

/**
 * Merge GitHub and Toggl weekly data
 */
export function mergeWeeklyData(
  githubData: WeeklyData[],
  togglData: WeeklyData[]
): WeeklyData[] {
  // Create a map of Toggl data by week start for efficient lookup
  const togglMap = new Map<string, number>();
  togglData.forEach(week => {
    togglMap.set(week.weekStart, week.hours);
  });

  // Merge the data, prioritizing GitHub data structure
  return githubData.map(week => ({
    weekStart: week.weekStart,
    commits: week.commits,
    hours: togglMap.get(week.weekStart) || 0
  }));
}

/**
 * Get projects that have GitHub repositories
 */
export function getProjectsWithGitHub(): Project[] {
  return loadProjects().filter(project =>
    project.githubRepo && project.githubRepo.length > 0
  );
}

/**
 * Get projects that have Toggl project IDs
 */
export function getProjectsWithToggl(): Project[] {
  return loadProjects().filter(project => project.togglProjectId && project.togglProjectId.trim() !== '');
}

/**
 * Get active projects (not ended or ended this year)
 */
export function getActiveProjects(): Project[] {
  const currentYear = new Date().getFullYear();
  return loadProjects().filter(project =>
    !project.endYear || project.endYear >= currentYear
  );
}

/**
 * Get all GitHub repositories from all projects
 */
export function getAllGitHubRepos(): string[] {
  const projects = loadProjects();
  const repos: string[] = [];

  projects.forEach(project => {
    if (project.githubRepo) {
      repos.push(...project.githubRepo);
    }
    if (project.githubRepoPrivate) {
      repos.push(...project.githubRepoPrivate);
    }
  });

  return repos;
}

/**
 * Get total number of repositories across all projects
 */
export function getTotalRepositoryCount(): number {
  return getAllGitHubRepos().length;
}

/**
 * Check if a project has a specific repository
 */
export function projectHasRepo(project: Project, repoName: string): boolean {
  const hasPublic = project.githubRepo?.includes(repoName) ?? false;
  const hasPrivate = project.githubRepoPrivate?.includes(repoName) ?? false;
  return hasPublic || hasPrivate;
}

/**
 * Get projects that contain a specific repository
 */
export function getProjectsByRepo(repoName: string): Project[] {
  return loadProjects().filter(project => projectHasRepo(project, repoName));
} 