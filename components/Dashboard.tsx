'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ProjectPulse from './ProjectPulse';
import { ProjectHealth, GitHubCommit, TogglTimeEntry } from '../lib/types';
import { calculateProjectHealth, getCurrentWeekBounds } from '../lib/utils';
// Import projects data
const projectsData = [
  {
    "name": "fwt. axis",
    "description": "My self-awareness habit framework on iOS with integrations to Apple Health and Toggl Track",
    "githubRepo": null,
    "githubRepoPrivate": ["sampittko/fwt-axis"],
    "togglProjectId": "211046031",
    "startYear": 2025,
    "endYear": null,
    "tags": ["Indie"],
    "url": "https://fwt.wtf/track-reflect-repeat?utm_source=samuelpitonak.sk",
    "logo": null,
    "targetWeeklyHours": 8
  },
  {
    "name": "Secret project",
    "description": "I've been building this since November in a team of 5 devs with Next.js and Payload CMS",
    "githubRepo": null,
    "githubRepoPrivate": ["extropysk/hookers", "extropysk/hookers-frontend"],
    "togglProjectId": "206566140",
    "startYear": 2024,
    "endYear": null,
    "tags": ["Entrepreneurship"],
    "url": null,
    "logo": null,
    "targetWeeklyHours": 8
  }
];

export default function Dashboard() {
  const [projectHealths, setProjectHealths] = useState<ProjectHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Fetch project health data
  const fetchProjectHealth = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setSyncing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const healthPromises = projectsData.map(async (project) => {
        try {
          // Fetch GitHub commits for all repos (public and private)
          const allCommits: GitHubCommit[] = [];

          // Fetch from private repos
          for (const repo of project.githubRepoPrivate) {
            try {
              const commitsRes = await fetch(`/api/github/commits?repo=${encodeURIComponent(repo)}`);
              if (commitsRes.ok) {
                const commits = await commitsRes.json();
                allCommits.push(...commits);
              }
            } catch (err) {
              console.warn(`Failed to fetch commits for ${repo}:`, err);
            }
          }

          // Fetch Toggl time entries
          let timeEntries: TogglTimeEntry[] = [];
          try {
            const timeRes = await fetch(`/api/toggl/time-entries?projectId=${project.togglProjectId}`);
            if (timeRes.ok) {
              timeEntries = await timeRes.json();
            }
          } catch (err) {
            console.warn(`Failed to fetch time entries for ${project.name}:`, err);
          }

          return calculateProjectHealth(project, allCommits, timeEntries);
        } catch (err) {
          console.error(`Error calculating health for ${project.name}:`, err);
          // Return a fallback health object
          return {
            project,
            weeklyHours: 0,
            targetHours: project.targetWeeklyHours,
            commits: 0,
            healthScore: 0,
            status: 'critical' as const
          };
        }
      });

      const healths = await Promise.all(healthPromises);
      setProjectHealths(healths);
      setLastRefresh(new Date());
    } catch {
      setError('Failed to calculate project health');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  // Manual refresh function
  const handleManualRefresh = () => {
    fetchProjectHealth(true);
  };



  // Initial load
  useEffect(() => {
    fetchProjectHealth(false);
  }, [fetchProjectHealth]);

  // Auto-refresh every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchProjectHealth(true);
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [fetchProjectHealth]);

  const { start, end } = getCurrentWeekBounds();
  const weekStr = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;

  const formatLastRefresh = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleManualRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                🫀 BuildPulse
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Project health dashboard for the week of {weekStr}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Sync Status */}
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  {syncing ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      <span>Syncing...</span>
                    </>
                  ) : lastRefresh ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Last sync: {formatLastRefresh(lastRefresh)}</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span>Never synced</span>
                    </>
                  )}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                  {projectHealths.filter(h => h.status === 'excellent' || h.status === 'good').length} / {projectHealths.length} healthy
                </div>
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleManualRefresh}
                disabled={syncing}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <div className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`}>
                  🔄
                </div>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Calculating project health...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {projectHealths.map((health, index) => (
                <ProjectPulse key={index} health={health} />
              ))}
            </div>



            {/* Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  📊 Weekly Summary
                </h2>
                {lastRefresh && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Auto-refresh every 10 minutes
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {projectHealths.filter(h => h.status === 'excellent').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Excellent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {projectHealths.filter(h => h.status === 'good').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Good</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {projectHealths.filter(h => h.status === 'warning').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Warning</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {projectHealths.filter(h => h.status === 'critical').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Critical</div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
} 