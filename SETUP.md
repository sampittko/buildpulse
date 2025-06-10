# BuildPulse Setup Instructions

## 🔧 Environment Setup

Create a `.env.local` file in the root directory with your API tokens:

```bash
# GitHub Personal Access Token
# Go to: GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
# Grant access to your repositories with "Contents" and "Metadata" permissions
GITHUB_TOKEN=your_github_token_here

# Toggl Track API Token  
# Go to: Toggl Track → Profile → API Token (at the bottom)
TOGGL_API_TOKEN=your_toggl_api_token_here
```

## 🚀 Running the Dashboard

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📊 How It Works

### Health Calculation
The dashboard calculates a health score (0-100) for each project based on:

- **Time Tracking (60% weight)**: Hours logged vs target weekly hours
- **GitHub Activity (40% weight)**: Number of commits in the current week

### Status Categories
- 🟢 **Excellent (80-100%)**: You're crushing it!
- 🔵 **Good (60-79%)**: On track, keep going
- 🟡 **Warning (40-59%)**: Needs attention
- 🔴 **Critical (0-39%)**: Requires immediate focus

### Week Definition
- Weeks start on **Saturday** and end on **Friday**
- All data is filtered to the current week period

## 🔍 Troubleshooting

### API Issues
- Verify your tokens are correct in `.env.local`
- Check that your GitHub token has access to the specified repositories
- Ensure your Toggl project IDs match the ones in `data/projects.json`

### Data Issues
- Private repositories require fine-grained GitHub tokens with repository access
- Time entries must be associated with the correct Toggl project ID
- The dashboard will show fallback data if APIs fail

## 🎨 Customization

You can modify the health calculation algorithm in `lib/utils.ts` by adjusting:
- Weight distribution between time tracking and commits
- Scoring thresholds for different status levels
- Points awarded per commit

## 📝 Adding Projects

Edit `data/projects.json` to add new projects:

```json
{
  "name": "Your Project",
  "description": "Project description",
  "githubRepo": null,
  "githubRepoPrivate": ["owner/repo-name"],
  "togglProjectId": "12345",
  "startYear": 2024,
  "endYear": null,
  "tags": ["Tag1", "Tag2"],
  "url": "https://project-url.com",
  "logo": null,
  "targetWeeklyHours": 8
}
``` 