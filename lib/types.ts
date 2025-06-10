export interface Project {
  name: string;
  description: string;
  githubRepo: string | null;
  githubRepoPrivate: string[];
  togglProjectId: string;
  startYear: number;
  endYear: number | null;
  tags: string[];
  url: string | null;
  logo: string | null;
  targetWeeklyHours: number;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      date: string;
    };
    message: string;
  };
  author: {
    login: string;
  } | null;
}

export interface TogglTimeEntry {
  id: number;
  project_id: number;
  duration: number;
  start: string;
  stop: string | null;
  description: string;
}

export interface ProjectHealth {
  project: Project;
  weeklyHours: number;
  targetHours: number;
  commits: number;
  healthScore: number; // 0-100
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

export interface WeekData {
  start: Date;
  end: Date;
  commits: GitHubCommit[];
  timeEntries: TogglTimeEntry[];
} 