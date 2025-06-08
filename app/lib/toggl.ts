import { TogglTimeData } from './types';
import { getWeekStart, getCurrentWeekDescription } from './date-utils';

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

    // Fetch ALL time entries for the date range (API doesn't support project filtering)
    const url = `https://api.track.toggl.com/api/v9/me/time_entries?start_date=${startDate}&end_date=${today}`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 403) {
        console.warn(`Access denied for Toggl API - check API token`);
        return {
          projectId,
          weeklyHours: 0,
          totalEntries: 0
        };
      }
      throw new Error(`Toggl API error: ${response.status} ${response.statusText}`);
    }

    const allTimeEntries: TogglTimeEntry[] = await response.json();

    // Filter time entries by project ID (client-side since API doesn't support this)
    const projectTimeEntries = allTimeEntries.filter(entry =>
      entry.project_id === parseInt(projectId)
    );

    // Calculate weekly hours (current week starting from Saturday)
    const weekStart = getWeekStart();

    console.log(`📅 Current week: ${getCurrentWeekDescription()}`);

    const weeklyEntries = projectTimeEntries.filter(entry => {
      const entryDate = new Date(entry.start);
      return entryDate >= weekStart;
    });

    const weeklyHours = weeklyEntries.reduce((total, entry) => {
      // Handle negative durations (running timers)
      const duration = entry.duration < 0 ? 0 : entry.duration;
      // Convert seconds to hours
      return total + (duration / 3600);
    }, 0);

    // Debug: Show some sample entries
    if (weeklyEntries.length > 0 && weeklyEntries.length <= 5) {
      console.log(`🔍 Sample weekly entries for project ${projectId}:`);
      weeklyEntries.forEach(entry => {
        const hours = entry.duration / 3600;
        const date = new Date(entry.start).toISOString().split('T')[0];
        console.log(`   ${date}: ${hours.toFixed(2)}h - ${entry.description || 'No description'}`);
      });
    } else if (weeklyEntries.length > 5) {
      console.log(`🔍 First 3 weekly entries for project ${projectId} (${weeklyEntries.length} total):`);
      weeklyEntries.slice(0, 3).forEach(entry => {
        const hours = entry.duration / 3600;
        const date = new Date(entry.start).toISOString().split('T')[0];
        console.log(`   ${date}: ${hours.toFixed(2)}h - ${entry.description || 'No description'}`);
      });
    }

    console.log(`✅ Fetched ${allTimeEntries.length} total entries, filtered to ${projectTimeEntries.length} for project ${projectId}, ${weeklyEntries.length} this week (${weeklyHours.toFixed(2)}h this week)`);

    return {
      projectId,
      weeklyHours: Math.round(weeklyHours * 100) / 100, // Round to 2 decimal places
      totalEntries: projectTimeEntries.length
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