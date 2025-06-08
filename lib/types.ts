export interface Project {
  name: string;
  description: string;
  githubRepo: string[] | null;
  togglProjectId: string;
  startYear: number;
  endYear?: number | null;
  tags: string[];
  url?: string | null;
  logo?: string | null;
}

export interface ProjectPulse {
  project: Project;
  weeklyCommits: number;
  weeklyHours: number;
  pulseScore: number;
  healthStatus: 'active' | 'slowing' | 'dormant';
}

export interface GitHubCommitData {
  repoName: string;
  weeklyCommits: number;
  lastCommitDate: string | null;
}

export interface ProjectGitHubData {
  projectName: string;
  repositories: GitHubCommitData[];
  totalWeeklyCommits: number;
}

export interface TogglTimeData {
  projectId: string;
  weeklyHours: number;
  totalEntries: number;
}

export type HealthStatus = 'active' | 'slowing' | 'dormant';

export interface PulseScoreConfig {
  commitWeight: number;
  hoursWeight: number;
  activeThreshold: number;
  slowingThreshold: number;
} 