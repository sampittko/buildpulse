import fs from 'fs';
import path from 'path';
import { ProjectPulse } from './types';

export interface DashboardData {
  projects: ProjectPulse[];
  lastUpdated: string;
  summary: {
    totalProjects: number;
    activeProjects: number;
    slowingProjects: number;
    dormantProjects: number;
    totalWeeklyCommits: number;
    totalWeeklyHours: number;
  };
}

/**
 * Load dashboard data from build output
 */
export function loadDashboardData(): DashboardData | null {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'build-output.json');

    if (!fs.existsSync(dataPath)) {
      console.warn('Build output not found. Run "npm run build-data" first.');
      return null;
    }

    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData) as DashboardData;

    return data;
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    return null;
  }
}

/**
 * Get mock data for development when build output doesn't exist
 */
export function getMockDashboardData(): DashboardData {
  const mockProjects: ProjectPulse[] = [
    {
      project: {
        name: 'fwt. axis',
        description: 'My self-awareness habit framework on iOS with integrations to Apple Health and Toggl Track',
        githubRepo: ['sampittko/fwt-axis'],
        togglProjectId: '211046031',
        startYear: 2025,
        endYear: null,
        tags: ['Hobby'],
        url: 'https://fwt.wtf/track-reflect-repeat?utm_source=samuelpitonak.sk',
        logo: null
      },
      weeklyCommits: 5,
      weeklyHours: 8.5,
      pulseScore: 24.5,
      healthStatus: 'active'
    },
    {
      project: {
        name: 'Secret project',
        description: "I've been building this since November in a team of 5 devs with Next.js and Payload CMS",
        githubRepo: ['extropysk/hookers', 'extropysk/hookers-frontend'],
        togglProjectId: '206566140',
        startYear: 2024,
        endYear: null,
        tags: ['Entrepreneurship'],
        url: null,
        logo: null
      },
      weeklyCommits: 12,
      weeklyHours: 15.2,
      pulseScore: 48.4,
      healthStatus: 'active'
    },
    {
      project: {
        name: 'Creator Dashboard',
        description: 'I needed a dashboard for accountability to track my content journey so here it is',
        githubRepo: ['sampittko/creator-dashboard'],
        togglProjectId: '210584842',
        startYear: 2025,
        endYear: 2025,
        tags: ['Hobby'],
        url: 'https://fwt.wtf/creator-dashboard?utm_source=samuelpitonak.sk',
        logo: null
      },
      weeklyCommits: 2,
      weeklyHours: 3.0,
      pulseScore: 9.0,
      healthStatus: 'slowing'
    }
  ];

  return {
    projects: mockProjects,
    lastUpdated: new Date().toISOString(),
    summary: {
      totalProjects: mockProjects.length,
      activeProjects: mockProjects.filter(p => p.healthStatus === 'active').length,
      slowingProjects: mockProjects.filter(p => p.healthStatus === 'slowing').length,
      dormantProjects: mockProjects.filter(p => p.healthStatus === 'dormant').length,
      totalWeeklyCommits: mockProjects.reduce((sum, p) => sum + p.weeklyCommits, 0),
      totalWeeklyHours: mockProjects.reduce((sum, p) => sum + p.weeklyHours, 0)
    }
  };
}

/**
 * Load dashboard data with fallback to mock data
 */
export function getDashboardData(): DashboardData {
  const data = loadDashboardData();
  return data || getMockDashboardData();
} 