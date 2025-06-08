#!/usr/bin/env tsx

import { fetchGitHubCommits, getGitHubRateLimit } from '../lib/github';
import { fetchTogglTimeEntries, fetchTogglProjects } from '../lib/toggl';
import { loadProjects } from '../lib/projects';

/**
 * Test script to verify integrations are working
 */
async function testIntegrations() {
  console.log('🧪 Testing BuildPulse integrations...\n');

  const githubToken = process.env.GITHUB_TOKEN;
  const togglToken = process.env.TOGGL_API_TOKEN;

  // Test GitHub Integration
  console.log('📊 Testing GitHub Integration...');
  if (githubToken) {
    try {
      const rateLimit = await getGitHubRateLimit(githubToken);
      console.log(`✅ GitHub API connected. Rate limit: ${rateLimit.remaining}/${rateLimit.limit}`);

      // Test with a known public repo
      const testCommits = await fetchGitHubCommits('sampittko', 'fwt-axis', githubToken);
      console.log(`✅ Sample repo test: ${testCommits.weeklyCommits} commits this week`);
    } catch (error) {
      console.error('❌ GitHub API test failed:', error);
    }
  } else {
    console.log('⚠️  GITHUB_TOKEN not found - testing with public API');
    try {
      const rateLimit = await getGitHubRateLimit();
      console.log(`✅ GitHub public API connected. Rate limit: ${rateLimit.remaining}/${rateLimit.limit}`);
    } catch (error) {
      console.error('❌ GitHub public API test failed:', error);
    }
  }

  console.log();

  // Test Toggl Integration
  console.log('⏱️  Testing Toggl Integration...');
  if (togglToken) {
    try {
      const projects = await fetchTogglProjects(togglToken);
      console.log(`✅ Toggl API connected. Found ${projects.length} projects:`);
      projects.slice(0, 3).forEach(project => {
        console.log(`   - ${project.name} (ID: ${project.id})`);
      });

      // Test with first project that has ID matching our data
      const buildProjects = loadProjects();
      const projectWithToggl = buildProjects.find(p => p.togglProjectId.trim() !== '');

      if (projectWithToggl) {
        const timeData = await fetchTogglTimeEntries(projectWithToggl.togglProjectId, togglToken);
        console.log(`✅ Sample time tracking test: ${timeData.weeklyHours}h this week for project ${projectWithToggl.togglProjectId}`);
      }
    } catch (error) {
      console.error('❌ Toggl API test failed:', error);
    }
  } else {
    console.log('⚠️  TOGGL_API_TOKEN not found - Toggl integration will be unavailable');
  }

  console.log();

  // Test Projects Loading
  console.log('📂 Testing Projects Loading...');
  try {
    const projects = loadProjects();
    console.log(`✅ Loaded ${projects.length} projects from data/projects.json`);

    const projectsWithGitHub = projects.filter(p => p.githubRepo && p.githubRepo.length > 0);
    const projectsWithToggl = projects.filter(p => p.togglProjectId.trim() !== '');

    console.log(`   - ${projectsWithGitHub.length} projects have GitHub repositories`);
    console.log(`   - ${projectsWithToggl.length} projects have Toggl tracking`);

    console.log('\n📋 Project Overview:');
    projects.forEach(project => {
      const github = project.githubRepo ? `GitHub: ${project.githubRepo.length} repos` : 'No GitHub';
      const toggl = project.togglProjectId.trim() ? `Toggl: ${project.togglProjectId}` : 'No Toggl';
      console.log(`   - ${project.name}: ${github}, ${toggl}`);
    });
  } catch (error) {
    console.error('❌ Projects loading failed:', error);
  }

  console.log('\n🎉 Integration test completed!');
}

// Run the test
testIntegrations().catch(console.error); 