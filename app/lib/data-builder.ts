import fs from 'fs';
import path from 'path';
import {
  loadProjects,
  calculateEnhancedPulseScore,
  getEnhancedHealthStatus,
  mergeWeeklyData
} from './projects';
import { fetchProjectGitHubData } from './github';
import { fetchTogglTimeEntries } from './toggl';
import { ProjectPulse } from './types';
import { getTrendStatus } from './trend-analysis';

interface BuildData {
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
 * Build all project pulse data by fetching from GitHub and Toggl APIs with trend analysis
 */
export async function buildProjectPulseData(): Promise<BuildData> {
  console.log('🚀 Building project pulse data with 3-month trend analysis...');

  const projects = loadProjects();
  const githubToken = process.env.GITHUB_TOKEN;
  const togglToken = process.env.TOGGL_API_TOKEN;

  if (!githubToken) {
    console.warn('⚠️  No GITHUB_TOKEN found in environment variables');
  }

  if (!togglToken) {
    console.warn('⚠️  No TOGGL_API_TOKEN found in environment variables');
  }

  const projectPulses: ProjectPulse[] = [];

  for (const project of projects) {
    console.log(`\n📊 Processing project: ${project.name}`);

    // Fetch GitHub data (combines public and private repos)
    const allGitHubRepos = [
      ...(project.githubRepo || []),
      ...(project.githubRepoPrivate || [])
    ];

    const githubData = await fetchProjectGitHubData(
      project.name,
      allGitHubRepos,
      githubToken
    );

    // Fetch Toggl data
    let togglData;
    if (project.togglProjectId && togglToken) {
      togglData = await fetchTogglTimeEntries(project.togglProjectId, togglToken);
    } else {
      // Create empty Toggl data structure
      togglData = {
        projectId: project.togglProjectId || '',
        weeklyHours: 0,
        totalEntries: 0,
        weeklyData: githubData.weeklyData.map(week => ({
          ...week,
          hours: 0
        }))
      };
    }

    // Merge GitHub and Toggl weekly data
    const mergedWeeklyData = mergeWeeklyData(githubData.weeklyData, togglData.weeklyData);

    // Calculate enhanced pulse score with trends and target awareness
    const {
      pulseScore,
      trendScore,
      commitTrend,
      hoursTrend,
      weeklyCommits,
      weeklyHours
    } = calculateEnhancedPulseScore(mergedWeeklyData, project.targetWeeklyHours);

    // Determine health status with trend consideration
    const healthStatus = getEnhancedHealthStatus(pulseScore, commitTrend, hoursTrend);

    // Determine trend status
    const trendStatus = getTrendStatus(commitTrend, hoursTrend);

    const projectPulse: ProjectPulse = {
      project,
      weeklyCommits,
      weeklyHours,
      weeklyData: mergedWeeklyData,
      commitTrend,
      hoursTrend,
      pulseScore,
      trendScore,
      healthStatus,
      trendStatus,
      // Target tracking
      hoursTarget: project.targetWeeklyHours,
      hoursProgress: project.targetWeeklyHours > 0 ? (hoursTrend.recent / project.targetWeeklyHours * 100) : 0,
    };

    projectPulses.push(projectPulse);

    // Log trend information
    console.log(`  📈 Commits trend: ${commitTrend.direction} (${commitTrend.changePercentage.toFixed(1)}%)`);
    console.log(`  ⏱️  Hours trend: ${hoursTrend.direction} (${hoursTrend.changePercentage.toFixed(1)}%)`);
    console.log(`  💯 Pulse score: ${pulseScore.toFixed(1)} (trend: ${trendScore.toFixed(1)})`);
    console.log(`  🎯 Status: ${healthStatus} (trending ${trendStatus})`);
  }

  // Calculate summary statistics
  const summary = {
    totalProjects: projectPulses.length,
    publicProjects: projects.filter(p => p.githubRepo && p.githubRepo.length > 0).length,
    privateProjects: projects.filter(p => p.githubRepoPrivate && p.githubRepoPrivate.length > 0).length,
    activeProjects: projectPulses.filter(p => p.healthStatus === 'active').length,
    slowingProjects: projectPulses.filter(p => p.healthStatus === 'slowing').length,
    dormantProjects: projectPulses.filter(p => p.healthStatus === 'dormant').length,
    totalWeeklyCommits: projectPulses.reduce((sum, p) => sum + p.weeklyCommits, 0),
    totalWeeklyHours: projectPulses.reduce((sum, p) => sum + p.weeklyHours, 0),
    totalTargetHours: projectPulses.reduce((sum, p) => sum + p.hoursTarget, 0),
    improvingProjects: projectPulses.filter(p => p.trendStatus === 'improving').length,
    decliningProjects: projectPulses.filter(p => p.trendStatus === 'declining').length,
    stableProjects: projectPulses.filter(p => p.trendStatus === 'stable').length,
  };

  console.log(`\n📊 Summary:`);
  console.log(`   📁 Repos: ${summary.publicProjects} public, ${summary.privateProjects} private`);
  console.log(`   🎯 Health: ${summary.activeProjects} active, ${summary.slowingProjects} slowing, ${summary.dormantProjects} dormant`);
  console.log(`   📈 Trends: ${summary.improvingProjects} improving, ${summary.stableProjects} stable, ${summary.decliningProjects} declining`);
  console.log(`   💻 Activity: ${summary.totalWeeklyCommits} commits, ${summary.totalWeeklyHours.toFixed(1)}h this week`);

  const buildData: BuildData = {
    projects: projectPulses,
    lastUpdated: new Date().toISOString(),
    summary
  };

  return buildData;
}

/**
 * Save build data to JSON file
 */
export function saveBuildData(buildData: BuildData): void {
  const outputPath = path.join(process.cwd(), 'data', 'build-output.json');

  // Ensure data directory exists
  const dataDir = path.dirname(outputPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Save with pretty formatting
  fs.writeFileSync(outputPath, JSON.stringify(buildData, null, 2));
  console.log(`💾 Build data saved to ${outputPath}`);
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