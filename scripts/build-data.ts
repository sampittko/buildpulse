#!/usr/bin/env tsx

import { config } from 'dotenv';
import { runFullBuild } from '../app/lib/data-builder';

// Load environment variables from .env file
config();

/**
 * CLI script for building BuildPulse data
 * This is intended to be run daily via CRON job
 */
async function main() {
  try {
    console.log(`🕐 BuildPulse data build started at ${new Date().toISOString()}`);

    // Run the full build process
    const buildData = await runFullBuild();

    console.log(`\n🎉 BuildPulse build completed successfully!`);
    console.log(`📊 Processed ${buildData.projects.length} projects`);
    console.log(`🏆 Top project: ${buildData.projects[0]?.project.name} (${buildData.projects[0]?.pulseScore.toFixed(1)})`);

    process.exit(0);
  } catch (error) {
    console.error('❌ BuildPulse build failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
} 