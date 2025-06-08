import fs from 'fs';
import path from 'path';
import { ProjectPulse, WeeklyData, TrendData } from './types';

export interface DashboardData {
  projects: ProjectPulse[];
  lastUpdated: string;
  summary: {
    totalProjects: number;
    publicProjects: number;
    privateProjects: number;
    activeProjects: number;
    slowingProjects: number;
    dormantProjects: number;
    totalWeeklyCommits: number;
    totalWeeklyHours: number;
    improvingProjects: number;
    decliningProjects: number;
    stableProjects: number;
  };
}

/**
 * Load dashboard data from build output (SERVER SIDE ONLY)
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
  // Generate mock weekly data for the last 12 weeks
  const generateMockWeeklyData = (): WeeklyData[] => {
    const weeks: WeeklyData[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));

      // Find the Saturday of this week
      const dayOfWeek = weekStart.getDay();
      const daysToSaturday = dayOfWeek === 6 ? 0 : dayOfWeek + 1;
      weekStart.setDate(weekStart.getDate() - daysToSaturday);

      weeks.push({
        weekStart: weekStart.toISOString().split('T')[0],
        commits: Math.floor(Math.random() * 8),
        hours: Math.floor(Math.random() * 15 * 100) / 100
      });
    }

    return weeks;
  };

  const generateMockTrend = (): TrendData => ({
    recent: 3.5,
    medium: 4.2,
    longer: 5.1,
    direction: 'stable',
    changePercentage: -5.2
  });

  const mockProjects: ProjectPulse[] = [
    {
      project: {
        name: 'fwt. axis',
        description: 'My self-awareness habit framework on iOS with integrations to Apple Health and Toggl Track',
        githubRepo: null,
        githubRepoPrivate: ['sampittko/fwt-axis'],
        togglProjectId: '211046031',
        startYear: 2025,
        endYear: null,
        tags: ['Hobby'],
        url: 'https://fwt.wtf/track-reflect-repeat?utm_source=samuelpitonak.sk',
        logo: null
      },
      weeklyCommits: 5,
      weeklyHours: 8.5,
      weeklyData: generateMockWeeklyData(),
      commitTrend: generateMockTrend(),
      hoursTrend: generateMockTrend(),
      pulseScore: 24.5,
      trendScore: 2.1,
      healthStatus: 'active',
      trendStatus: 'improving'
    },
    {
      project: {
        name: 'Secret project',
        description: "I've been building this since November in a team of 5 devs with Next.js and Payload CMS",
        githubRepo: null,
        githubRepoPrivate: ['extropysk/hookers', 'extropysk/hookers-frontend'],
        togglProjectId: '206566140',
        startYear: 2024,
        endYear: null,
        tags: ['Entrepreneurship'],
        url: null,
        logo: null
      },
      weeklyCommits: 12,
      weeklyHours: 15.2,
      weeklyData: generateMockWeeklyData(),
      commitTrend: generateMockTrend(),
      hoursTrend: generateMockTrend(),
      pulseScore: 48.4,
      trendScore: 3.8,
      healthStatus: 'active',
      trendStatus: 'stable'
    },
    {
      project: {
        name: 'Creator Dashboard',
        description: 'I needed a dashboard for accountability to track my content journey so here it is',
        githubRepo: ['sampittko/creator-dashboard'],
        githubRepoPrivate: null,
        togglProjectId: '210584842',
        startYear: 2025,
        endYear: 2025,
        tags: ['Hobby'],
        url: 'https://fwt.wtf/creator-dashboard?utm_source=samuelpitonak.sk',
        logo: null
      },
      weeklyCommits: 2,
      weeklyHours: 3.0,
      weeklyData: generateMockWeeklyData(),
      commitTrend: generateMockTrend(),
      hoursTrend: generateMockTrend(),
      pulseScore: 9.0,
      trendScore: 0.5,
      healthStatus: 'slowing',
      trendStatus: 'declining'
    }
  ];

  return {
    projects: mockProjects,
    lastUpdated: new Date().toISOString(),
    summary: {
      totalProjects: mockProjects.length,
      publicProjects: mockProjects.filter(p => p.project.githubRepo && p.project.githubRepo.length > 0).length,
      privateProjects: mockProjects.filter(p => p.project.githubRepoPrivate && p.project.githubRepoPrivate.length > 0).length,
      activeProjects: mockProjects.filter(p => p.healthStatus === 'active').length,
      slowingProjects: mockProjects.filter(p => p.healthStatus === 'slowing').length,
      dormantProjects: mockProjects.filter(p => p.healthStatus === 'dormant').length,
      totalWeeklyCommits: mockProjects.reduce((sum, p) => sum + p.weeklyCommits, 0),
      totalWeeklyHours: mockProjects.reduce((sum, p) => sum + p.weeklyHours, 0),
      improvingProjects: mockProjects.filter(p => p.trendStatus === 'improving').length,
      decliningProjects: mockProjects.filter(p => p.trendStatus === 'declining').length,
      stableProjects: mockProjects.filter(p => p.trendStatus === 'stable').length,
    }
  };
}

/**
 * Load dashboard data with fallback to mock data (SERVER SIDE ONLY)
 */
export function getDashboardData(): DashboardData {
  const data = loadDashboardData();
  return data || getMockDashboardData();
}

