import { GitHubCommitData, ProjectGitHubData } from './types';

interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      date: string;
    };
  };
}

interface GitHubApiResponse {
  commits: GitHubCommit[];
  error?: string;
}

/**
 * Fetch commits from GitHub API for a specific repository
 */
export async function fetchGitHubCommits(
  owner: string,
  repo: string,
  token?: string
): Promise<GitHubCommitData> {
  const repoName = `${owner}/${repo}`;

  try {
    // Calculate date 4 weeks ago
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const since = fourWeeksAgo.toISOString();

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'BuildPulse-Bot'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `https://api.github.com/repos/${owner}/${repo}/commits?since=${since}&per_page=100`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Repository ${repoName} not found or not accessible`);
        return {
          repoName,
          weeklyCommits: 0,
          lastCommitDate: null
        };
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const commits: GitHubCommit[] = await response.json();

    // Calculate weekly commits (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyCommits = commits.filter(commit =>
      new Date(commit.commit.author.date) >= oneWeekAgo
    ).length;

    const lastCommitDate = commits.length > 0
      ? commits[0].commit.author.date
      : null;

    console.log(`✅ Fetched ${commits.length} commits for ${repoName} (${weeklyCommits} this week)`);

    return {
      repoName,
      weeklyCommits,
      lastCommitDate
    };

  } catch (error) {
    console.error(`❌ Error fetching commits for ${repoName}:`, error);
    return {
      repoName,
      weeklyCommits: 0,
      lastCommitDate: null
    };
  }
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
    return {
      projectName,
      repositories: [],
      totalWeeklyCommits: 0
    };
  }

  const repoPromises = repositories.map(async (repoPath) => {
    const [owner, repo] = repoPath.split('/');
    if (!owner || !repo) {
      console.warn(`Invalid repository path: ${repoPath}`);
      return {
        repoName: repoPath,
        weeklyCommits: 0,
        lastCommitDate: null
      };
    }

    return fetchGitHubCommits(owner, repo, token);
  });

  const repoData = await Promise.all(repoPromises);
  const totalWeeklyCommits = repoData.reduce((sum, repo) => sum + repo.weeklyCommits, 0);

  return {
    projectName,
    repositories: repoData,
    totalWeeklyCommits
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