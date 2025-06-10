'use client';

import React, { useState, useEffect } from 'react';
import ProjectPulse from './ProjectPulse';
import { Project, ProjectHealth, GitHubCommit, TogglTimeEntry } from '../lib/types';
import { calculateProjectHealth, getCurrentWeekBounds } from '../lib/utils';
import projectsData from '../data/projects.json';

export default function Dashboard() {
  const [projectHealths, setProjectHealths] = useState<ProjectHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate health for each project
  useEffect(() => {

    const fetchProjectHealth = async () => {
      setLoading(true);
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

      try {
        const healths = await Promise.all(healthPromises);
        setProjectHealths(healths);
      } catch {
        setError('Failed to calculate project health');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectHealth();
  }, []);

  const { start, end } = getCurrentWeekBounds();
  const weekStr = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
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
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Week starts Saturday
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {projectHealths.filter(h => h.status === 'excellent' || h.status === 'good').length} / {projectHealths.length} healthy
              </div>
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                📊 Weekly Summary
              </h2>
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