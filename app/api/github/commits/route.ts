import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { getCurrentWeekBounds } from '../../../../lib/utils';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const repo = searchParams.get('repo');

  if (!repo) {
    return NextResponse.json({ error: 'Repository parameter is required' }, { status: 400 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'GitHub token not configured' }, { status: 500 });
  }

  try {
    const octokit = new Octokit({ auth: token });
    const [owner, repoName] = repo.split('/');
    const { start } = getCurrentWeekBounds();

    const { data: commits } = await octokit.rest.repos.listCommits({
      owner,
      repo: repoName,
      since: start.toISOString(),
      per_page: 100,
    });

    return NextResponse.json(commits);
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json({ error: 'Failed to fetch commits' }, { status: 500 });
  }
} 