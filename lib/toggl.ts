import { TogglTimeData } from './types';

interface TogglTimeEntry {
  id: number;
  project_id: number;
  duration: number; // in seconds
  start: string;
  stop: string | null;
  description: string;
}

interface TogglProject {
  id: number;
  name: string;
  workspace_id: number;
}

/**
 * Fetch time entries from Toggl API for a specific project
 */
export async function fetchTogglTimeEntries(
  projectId: string,
  apiToken: string
): Promise<TogglTimeData> {
  try {
    // Calculate date 4 weeks ago
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const startDate = fourWeeksAgo.toISOString().split('T')[0]; // YYYY-MM-DD format

    const today = new Date().toISOString().split('T')[0];

    // Toggl API v9 uses Basic Auth with API token as username and 'api_token' as password
    const auth = Buffer.from(`${apiToken}:api_token`).toString('base64');

    const headers = {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    };

    // Fetch time entries for the project
    const url = `https://api.track.toggl.com/api/v9/me/time_entries?start_date=${startDate}&end_date=${today}&project_id=${projectId}`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 403) {
        console.warn(`Access denied for Toggl project ${projectId} - check API token`);
        return {
          projectId,
          weeklyHours: 0,
          totalEntries: 0
        };
      }
      throw new Error(`Toggl API error: ${response.status} ${response.statusText}`);
    }

    const timeEntries: TogglTimeEntry[] = await response.json();

    // Calculate weekly hours (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyEntries = timeEntries.filter(entry =>
      new Date(entry.start) >= oneWeekAgo
    );

    const weeklyHours = weeklyEntries.reduce((total, entry) => {
      // Convert seconds to hours
      return total + (entry.duration / 3600);
    }, 0);

    console.log(`✅ Fetched ${timeEntries.length} time entries for project ${projectId} (${weeklyHours.toFixed(2)}h this week)`);

    return {
      projectId,
      weeklyHours: Math.round(weeklyHours * 100) / 100, // Round to 2 decimal places
      totalEntries: timeEntries.length
    };

  } catch (error) {
    console.error(`❌ Error fetching Toggl data for project ${projectId}:`, error);
    return {
      projectId,
      weeklyHours: 0,
      totalEntries: 0
    };
  }
}

/**
 * Fetch user's Toggl projects to validate project IDs
 */
export async function fetchTogglProjects(apiToken: string): Promise<TogglProject[]> {
  try {
    const auth = Buffer.from(`${apiToken}:api_token`).toString('base64');

    const headers = {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch('https://api.track.toggl.com/api/v9/me/projects', { headers });

    if (!response.ok) {
      throw new Error(`Toggl API error: ${response.status} ${response.statusText}`);
    }

    const projects: TogglProject[] = await response.json();
    console.log(`✅ Fetched ${projects.length} Toggl projects`);

    return projects;

  } catch (error) {
    console.error('❌ Error fetching Toggl projects:', error);
    return [];
  }
}

/**
 * Validate if a project ID exists in user's Toggl account
 */
export async function validateTogglProjectId(
  projectId: string,
  apiToken: string
): Promise<boolean> {
  try {
    const projects = await fetchTogglProjects(apiToken);
    return projects.some(project => project.id.toString() === projectId);
  } catch (error) {
    console.error(`Error validating Toggl project ID ${projectId}:`, error);
    return false;
  }
}

/**
 * Get Toggl project name by ID
 */
export async function getTogglProjectName(
  projectId: string,
  apiToken: string
): Promise<string | null> {
  try {
    const projects = await fetchTogglProjects(apiToken);
    const project = projects.find(p => p.id.toString() === projectId);
    return project?.name || null;
  } catch (error) {
    console.error(`Error getting Toggl project name for ${projectId}:`, error);
    return null;
  }
} 