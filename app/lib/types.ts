export interface Project {
  name: string;
  description: string;
  githubRepo: string[] | null; // Public repositories
  githubRepoPrivate: string[] | null; // Private repositories
  togglProjectId: string;
  startYear: number;
  endYear?: number | null;
  tags: string[];
  url?: string | null;
  logo?: string | null;
  targetWeeklyHours: number; // Expected weekly time investment
}

export interface WeeklyData {
  weekStart: string; // ISO date string for the start of the week (Saturday)
  commits: number;
  hours: number;
}

export interface TrendData {
  recent: number; // Last 2 weeks average
  medium: number; // Last 4 weeks average  
  longer: number; // Last 12 weeks average
  direction: 'increasing' | 'decreasing' | 'stable';
  changePercentage: number; // Percentage change over the period
}

export interface ProjectPulse {
  project: Project;
  // Current week data (for backward compatibility)
  weeklyCommits: number;
  weeklyHours: number;
  // 3-month trend data
  weeklyData: WeeklyData[];
  commitTrend: TrendData;
  hoursTrend: TrendData;
  // Enhanced pulse score
  pulseScore: number;
  trendScore: number; // Additional score based on trends
  healthStatus: 'active' | 'slowing' | 'dormant';
  trendStatus: 'improving' | 'stable' | 'declining';
  // Target tracking
  hoursTarget: number; // Target weekly hours (copied from project)
  hoursProgress: number; // Percentage of target achieved (weeklyHours / hoursTarget * 100)
}

export interface GitHubCommitData {
  repoName: string;
  weeklyCommits: number;
  lastCommitDate: string | null;
  // Enhanced with 3-month data
  weeklyData: WeeklyData[];
  totalCommits: number;
}

export interface ProjectGitHubData {
  projectName: string;
  repositories: GitHubCommitData[];
  totalWeeklyCommits: number;
  weeklyData: WeeklyData[];
}

export interface TogglTimeData {
  projectId: string;
  weeklyHours: number;
  totalEntries: number;
  // Enhanced with 3-month data
  weeklyData: WeeklyData[];
}

export type HealthStatus = 'active' | 'slowing' | 'dormant';

export interface PulseScoreConfig {
  commitWeight: number;
  hoursWeight: number;
  activeThreshold: number;
  slowingThreshold: number;
  // New trend-based weights
  recentWeight: number; // Weight for last 2 weeks
  mediumWeight: number; // Weight for last 4 weeks
  longerWeight: number; // Weight for last 12 weeks
  trendWeight: number; // Weight for trend direction
  // Target-based adjustments
  targetCompletionBonus: number; // Bonus for meeting target hours
  targetCompletionPenalty: number; // Penalty for missing target hours
} 