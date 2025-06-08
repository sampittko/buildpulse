import fs from 'fs';
import path from 'path';
import { Project, ProjectPulse, HealthStatus, PulseScoreConfig } from './types';

// Default pulse score configuration
const DEFAULT_PULSE_CONFIG: PulseScoreConfig = {
  commitWeight: 1.5,
  hoursWeight: 2,
  activeThreshold: 10,
  slowingThreshold: 5,
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
 * Calculate pulse score based on commits and hours
 */
export function calculatePulseScore(
  weeklyCommits: number,
  weeklyHours: number,
  config: PulseScoreConfig = DEFAULT_PULSE_CONFIG
): number {
  return (weeklyCommits * config.commitWeight) + (weeklyHours * config.hoursWeight);
}

/**
 * Determine health status based on pulse score
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
  return project.githubRepo?.includes(repoName) ?? false;
}

/**
 * Get projects that contain a specific repository
 */
export function getProjectsByRepo(repoName: string): Project[] {
  return loadProjects().filter(project => projectHasRepo(project, repoName));
} 