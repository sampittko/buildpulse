import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getCurrentWeekBounds } from '../../../../lib/utils';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: 'Project ID parameter is required' }, { status: 400 });
  }

  const token = process.env.TOGGL_API_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Toggl API token not configured' }, { status: 500 });
  }

  try {
    const { start, end } = getCurrentWeekBounds();

    const response = await axios.get('https://api.track.toggl.com/api/v9/me/time_entries', {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${token}:api_token`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      params: {
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      }
    });

    // Filter entries for the specific project
    const projectEntries = response.data.filter((entry: { project_id?: number | string }) =>
      entry.project_id?.toString() === projectId
    );

    return NextResponse.json(projectEntries);
  } catch (error) {
    console.error('Toggl API error:', error);
    return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 });
  }
} 