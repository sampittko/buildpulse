import { GitHubCommitData, ProjectGitHubData, WeeklyData } from './types';
import { getWeekStart } from './date-utils';
import { generateWeekStarts } from './trend-analysis';

interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      date: string;
    };
  };
}

/**
 * Fetch commits from GitHub API for a specific repository with 3-month trend data
 */
export async function fetchGitHubCommits(
  owner: string,
  repo: string,
  token?: string
): Promise<GitHubCommitData> {
  const repoName = `${owner}/${repo}`;

  try {
    // Calculate date 12 weeks ago (3 months)
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84); // 12 weeks * 7 days
    const since = twelveWeeksAgo.toISOString();

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'BuildPulse-Bot'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `https://api.github.com/repos/${owner}/${repo}/commits?since=${since}&per_page=300`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Repository ${repoName} not found or not accessible`);
        return createEmptyCommitData(repoName);
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const commits: GitHubCommit[] = await response.json();

    // Generate weekly data for the last 12 weeks
    const weekStarts = generateWeekStarts(12);
    const weeklyData: WeeklyData[] = weekStarts.map(weekStart => {
      const weekStartDate = new Date(weekStart);
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 7);

      const weekCommits = commits.filter(commit => {
        const commitDate = new Date(commit.commit.author.date);
        return commitDate >= weekStartDate && commitDate < weekEndDate;
      }).length;

      return {
        weekStart,
        commits: weekCommits,
        hours: 0 // Will be filled by Toggl data
      };
    });

    // Calculate current week commits (for backward compatibility)
    const currentWeekStart = getWeekStart();
    const weeklyCommits = commits.filter(commit =>
      new Date(commit.commit.author.date) >= currentWeekStart
    ).length;

    const lastCommitDate = commits.length > 0
      ? commits[0].commit.author.date
      : null;

    console.log(`✅ Fetched ${commits.length} total commits for ${repoName} over 12 weeks (${weeklyCommits} this week)`);

    return {
      repoName,
      weeklyCommits,
      lastCommitDate,
      weeklyData,
      totalCommits: commits.length
    };

  } catch (error) {
    console.error(`❌ Error fetching commits for ${repoName}:`, error);
    return createEmptyCommitData(repoName);
  }
}

/**
 * Create empty commit data structure
 */
function createEmptyCommitData(repoName: string): GitHubCommitData {
  const weekStarts = generateWeekStarts(12);
  const weeklyData: WeeklyData[] = weekStarts.map(weekStart => ({
    weekStart,
    commits: 0,
    hours: 0
  }));

  return {
    repoName,
    weeklyCommits: 0,
    lastCommitDate: null,
    weeklyData,
    totalCommits: 0
  };
}

/**
 * Fetch commits for multiple repositories of a project
 */
export async function fetchProjectGitHubData(
  projectName: string,
  repositories: string[] | null,
  token?: string
): Promise<ProjectGitHubData> {
  if (!repositories || repositories.length === 0) {
    const weekStarts = generateWeekStarts(12);
    const weeklyData: WeeklyData[] = weekStarts.map(weekStart => ({
      weekStart,
      commits: 0,
      hours: 0
    }));

    return {
      projectName,
      repositories: [],
      totalWeeklyCommits: 0,
      weeklyData
    };
  }

  const repoPromises = repositories.map(async (repoPath) => {
    const [owner, repo] = repoPath.split('/');
    if (!owner || !repo) {
      console.warn(`Invalid repository path: ${repoPath}`);
      return createEmptyCommitData(repoPath);
    }

    return fetchGitHubCommits(owner, repo, token);
  });

  const repoData = await Promise.all(repoPromises);
  const totalWeeklyCommits = repoData.reduce((sum, repo) => sum + repo.weeklyCommits, 0);

  // Combine weekly data from all repositories
  const weekStarts = generateWeekStarts(12);
  const combinedWeeklyData: WeeklyData[] = weekStarts.map(weekStart => {
    const totalCommits = repoData.reduce((sum, repo) => {
      const weekData = repo.weeklyData.find(w => w.weekStart === weekStart);
      return sum + (weekData?.commits || 0);
    }, 0);

    return {
      weekStart,
      commits: totalCommits,
      hours: 0 // Will be filled by Toggl data
    };
  });

  return {
    projectName,
    repositories: repoData,
    totalWeeklyCommits,
    weeklyData: combinedWeeklyData
  };
}

/**
 * Get GitHub API rate limit info
 */
export async function getGitHubRateLimit(token?: string): Promise<{
  limit: number;
  remaining: number;
  reset: Date;
}> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'BuildPulse-Bot'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch('https://api.github.com/rate_limit', { headers });
    const data = await response.json();

    return {
      limit: data.rate.limit,
      remaining: data.rate.remaining,
      reset: new Date(data.rate.reset * 1000)
    };
  } catch (error) {
    console.error('Error fetching GitHub rate limit:', error);
    return {
      limit: 60, // Default for unauthenticated requests
      remaining: 0,
      reset: new Date(Date.now() + 3600000) // 1 hour from now
    };
  }
} 