# BuildPulse

I needed a project health dashboard to track my coding progress and time commitment across multiple projects so here it is.

## What it does

BuildPulse monitors your project health by combining:
- **GitHub commit activity** from your repositories
- **Time tracking data** from Toggl Track 
- **Health scoring** based on weekly targets and actual progress

Each project gets a health score (0-100%) with color-coded status indicators to help you stay accountable and maintain momentum across all your work.

## Quick Start

1. Copy `.env.local.example` to `.env.local` and add your tokens:
   - GitHub Personal Access Token (with repo access)
   - Toggl Track API Token
   - Your GitHub username

2. Install and run:
```bash
npm install
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Configuration

Edit the projects array in `components/Dashboard.tsx` to track your own projects. Each project needs:
- GitHub repository (public or private)
- Toggl project ID
- Target weekly hours
- Basic project info

See `SETUP.md` for detailed configuration instructions.

---

Built with Next.js, TypeScript, and Tailwind CSS.