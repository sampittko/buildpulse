import fs from 'fs';
import path from 'path';
import {
  loadProjects,
  calculatePulseScore,
  getHealthStatus
} from './projects';
import { fetchProjectGitHubData } from './github';
import { fetchTogglTimeEntries } from './toggl';
import { ProjectPulse } from './types';

interface BuildData {
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
 * Build all project pulse data by fetching from GitHub and Toggl APIs
 */
export async function buildProjectPulseData(): Promise<BuildData> {
  console.log('🚀 Starting BuildPulse data generation...');

  const startTime = Date.now();
  const projects = loadProjects();

  const githubToken = process.env.GITHUB_TOKEN;
  const togglToken = process.env.TOGGL_API_TOKEN;

  if (!githubToken) {
    console.warn('⚠️  GITHUB_TOKEN not found - GitHub data will be limited to public repos');
  }

  if (!togglToken) {
    console.warn('⚠️  TOGGL_API_TOKEN not found - Toggl data will be unavailable');
  }

  const projectPulses: ProjectPulse[] = [];

  // Process each project
  for (const project of projects) {
    console.log(`\n📊 Processing project: ${project.name}`);

    // Fetch GitHub data
    const githubData = await fetchProjectGitHubData(
      project.name,
      project.githubRepo,
      githubToken
    );

    // Fetch Toggl data
    let togglData = { projectId: project.togglProjectId, weeklyHours: 0, totalEntries: 0 };
    if (togglToken && project.togglProjectId.trim()) {
      togglData = await fetchTogglTimeEntries(project.togglProjectId, togglToken);
    }

    // Calculate pulse score
    const pulseScore = calculatePulseScore(
      githubData.totalWeeklyCommits,
      togglData.weeklyHours
    );

    // Determine health status
    const healthStatus = getHealthStatus(pulseScore);

    const projectPulse: ProjectPulse = {
      project,
      weeklyCommits: githubData.totalWeeklyCommits,
      weeklyHours: togglData.weeklyHours,
      pulseScore,
      healthStatus
    };

    projectPulses.push(projectPulse);

    console.log(`   ${getHealthEmoji(healthStatus)} ${project.name}: ${pulseScore.toFixed(1)} (${githubData.totalWeeklyCommits} commits, ${togglData.weeklyHours}h)`);
  }

  // Calculate summary statistics
  const summary = {
    totalProjects: projectPulses.length,
    activeProjects: projectPulses.filter(p => p.healthStatus === 'active').length,
    slowingProjects: projectPulses.filter(p => p.healthStatus === 'slowing').length,
    dormantProjects: projectPulses.filter(p => p.healthStatus === 'dormant').length,
    totalWeeklyCommits: projectPulses.reduce((sum, p) => sum + p.weeklyCommits, 0),
    totalWeeklyHours: Math.round(projectPulses.reduce((sum, p) => sum + p.weeklyHours, 0) * 100) / 100
  };

  const buildData: BuildData = {
    projects: projectPulses.sort((a, b) => b.pulseScore - a.pulseScore), // Sort by pulse score descending
    lastUpdated: new Date().toISOString(),
    summary
  };

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log(`\n✅ BuildPulse data generation completed in ${duration}s`);
  console.log(`📈 Summary: ${summary.activeProjects} active, ${summary.slowingProjects} slowing, ${summary.dormantProjects} dormant`);
  console.log(`💻 Total: ${summary.totalWeeklyCommits} commits, ${summary.totalWeeklyHours}h this week`);

  return buildData;
}

/**
 * Save build data to JSON file
 */
export async function saveBuildData(buildData: BuildData): Promise<void> {
  const outputPath = path.join(process.cwd(), 'data', 'build-output.json');

  try {
    await fs.promises.writeFile(
      outputPath,
      JSON.stringify(buildData, null, 2),
      'utf8'
    );
    console.log(`💾 Build data saved to ${outputPath}`);
  } catch (error) {
    console.error('❌ Error saving build data:', error);
    throw error;
  }
}

/**
 * Load build data from JSON file
 */
export function loadBuildData(): BuildData | null {
  const outputPath = path.join(process.cwd(), 'data', 'build-output.json');

  try {
    const data = fs.readFileSync(outputPath, 'utf8');
    return JSON.parse(data) as BuildData;
  } catch (error) {
    console.warn('⚠️  No build data found or error loading:', error);
    return null;
  }
}

/**
 * Full build process: fetch data and save to file
 */
export async function runFullBuild(): Promise<BuildData> {
  const buildData = await buildProjectPulseData();
  await saveBuildData(buildData);
  return buildData;
}

/**
 * Get emoji for health status
 */
function getHealthEmoji(status: string): string {
  switch (status) {
    case 'active': return '🟢';
    case 'slowing': return '🟡';
    case 'dormant': return '🔴';
    default: return '⚪';
  }
} 