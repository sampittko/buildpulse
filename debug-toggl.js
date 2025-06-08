const fetch = require('node-fetch');
require('dotenv').config();

async function debugTogglAPI() {
  const apiToken = process.env.TOGGL_API_TOKEN;
  if (!apiToken) {
    console.log('No TOGGL_API_TOKEN found');
    return;
  }

  const auth = Buffer.from(`${apiToken}:api_token`).toString('base64');
  const headers = {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json',
  };

  // Get all projects first
  console.log('🔍 Fetching all projects...');
  const projectsResponse = await fetch('https://api.track.toggl.com/api/v9/me/projects', { headers });
  const projects = await projectsResponse.json();
  console.log('Projects found:', projects.map(p => `${p.name} (ID: ${p.id})`));

  // Test fetching time entries for different projects
  const testProjects = ['211809379', '211046031', '210584842'];

  for (const projectId of testProjects) {
    console.log(`\n📊 Testing project ${projectId}...`);

    const startDate = '2025-06-01';
    const endDate = '2025-06-08';

    const url = `https://api.track.toggl.com/api/v9/me/time_entries?start_date=${startDate}&end_date=${endDate}&project_id=${projectId}`;
    console.log('URL:', url);

    const response = await fetch(url, { headers });
    const entries = await response.json();

    console.log(`Found ${entries.length} entries for project ${projectId}`);
    if (entries.length > 0) {
      entries.slice(0, 3).forEach(entry => {
        const hours = entry.duration / 3600;
        const date = entry.start.split('T')[0];
        console.log(`   ${date}: ${hours.toFixed(2)}h - ${entry.description || 'No description'} (Project: ${entry.project_id})`);
      });
    }
  }
}

debugTogglAPI().catch(console.error); 