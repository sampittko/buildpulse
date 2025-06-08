import { TogglTimeData, WeeklyData } from './types';
import { getWeekStart, getCurrentWeekDescription } from './date-utils';
import { generateWeekStarts } from './trend-analysis';

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
 * Fetch time entries from Toggl API for a specific project with 3-month trend data
 */
export async function fetchTogglTimeEntries(
  projectId: string,
  apiToken: string
): Promise<TogglTimeData> {
  try {
    // Calculate date 12 weeks ago (3 months)
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84); // 12 weeks * 7 days
    const startDate = twelveWeeksAgo.toISOString().split('T')[0]; // YYYY-MM-DD format

    const today = new Date().toISOString().split('T')[0];

    const auth = Buffer.from(`${apiToken}:api_token`).toString('base64');
    const headers = {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    };

    // Fetch ALL time entries for the date range (Toggl API doesn't support project filtering in URL)
    const url = `https://api.track.toggl.com/api/v9/me/time_entries?start_date=${startDate}&end_date=${today}`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`Toggl API error: ${response.status} ${response.statusText}`);
    }

    const allEntries: TogglTimeEntry[] = await response.json();

    // Filter entries for this specific project
    const projectEntries = allEntries.filter(entry =>
      entry.project_id === parseInt(projectId)
    );

    console.log(`🔍 Toggl: Fetched ${allEntries.length} total entries, ${projectEntries.length} for project ${projectId}`);

    // Generate weekly data for the last 12 weeks
    const weekStarts = generateWeekStarts(12);
    const weeklyData: WeeklyData[] = weekStarts.map(weekStart => {
      const weekStartDate = new Date(weekStart);
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 7);

      const weekEntries = projectEntries.filter(entry => {
        const entryDate = new Date(entry.start);
        return entryDate >= weekStartDate && entryDate < weekEndDate;
      });

      const weekHours = weekEntries.reduce((total, entry) => {
        // Handle negative durations (running timers) by treating them as 0
        const duration = entry.duration < 0 ? 0 : entry.duration;
        return total + (duration / 3600); // Convert seconds to hours
      }, 0);

      return {
        weekStart,
        commits: 0, // Will be filled by GitHub data
        hours: weekHours
      };
    });

    // Calculate current week hours (for backward compatibility)
    const currentWeekStart = getWeekStart();
    const currentWeekEntries = projectEntries.filter(entry => {
      const entryDate = new Date(entry.start);
      return entryDate >= currentWeekStart;
    });

    const weeklyHours = currentWeekEntries.reduce((total, entry) => {
      // Handle negative durations (running timers)
      const duration = entry.duration < 0 ? 0 : entry.duration;
      return total + (duration / 3600); // Convert seconds to hours
    }, 0);

    // Debug: Show sample entries for current week
    if (currentWeekEntries.length > 0) {
      const sampleEntry = currentWeekEntries[0];
      const sampleDate = new Date(sampleEntry.start).toISOString().split('T')[0];
      const sampleHours = (sampleEntry.duration < 0 ? 0 : sampleEntry.duration) / 3600;
      console.log(`🔍 Sample weekly entries: ${sampleDate}: ${sampleHours.toFixed(2)}h - ${sampleEntry.description || 'No description'}`);
    }

    console.log(`✅ Toggl: Project ${projectId} has ${projectEntries.length} entries over 12 weeks, ${weeklyHours.toFixed(2)}h this week ${getCurrentWeekDescription()}`);

    return {
      projectId,
      weeklyHours,
      totalEntries: projectEntries.length,
      weeklyData
    };

  } catch (error) {
    console.error(`❌ Error fetching Toggl data for project ${projectId}:`, error);

    // Return empty data structure
    const weekStarts = generateWeekStarts(12);
    const weeklyData: WeeklyData[] = weekStarts.map(weekStart => ({
      weekStart,
      commits: 0,
      hours: 0
    }));

    return {
      projectId,
      weeklyHours: 0,
      totalEntries: 0,
      weeklyData
    };
  }
}

/**
 * Get available Toggl projects
 */
export async function getTogglProjects(apiToken: string): Promise<TogglProject[]> {
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
    return projects;

  } catch (error) {
    console.error('Error fetching Toggl projects:', error);
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
    const projects = await getTogglProjects(apiToken);
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
    const projects = await getTogglProjects(apiToken);
    const project = projects.find(p => p.id.toString() === projectId);
    return project?.name || null;
  } catch (error) {
    console.error(`Error getting Toggl project name for ${projectId}:`, error);
    return null;
  }
} 