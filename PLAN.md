# BuildPulse.dev – MVP Implementation Plan

> Track the pulse of your personal projects using GitHub commits and Toggl time entries.  
> **MVP focused on a single user (you)**. No auth. All data lives locally or in the deployed backend.

---

## 🧠 MVP Goal

A personal dashboard that gives you a **health score per project**, based on:
- Recent GitHub commit activity
- Recent Toggl time entries

---

## 🧱 MVP Feature Scope

### 🗂 Project Definition
- Define projects statically in a local file (`/data/projects.json`)
- Fields:
  - `name`
  - `description`
  - `githubRepo` (e.g. `sampittko/edi`)
  - `togglProjectId` (string)
  - `startYear`, `endYear?`
  - `tags` (array)
  - Optional: `url`, `logo`

### 🔗 GitHub Integration
- Fetch commits using GitHub API
- Calculate weekly commit count (last 4 weeks)
- Store cache in local file or in-memory

### ⏱️ Toggl Integration
- Fetch time entries for each `togglProjectId`
- Calculate total hours in the last 4 weeks

### 🧮 Pulse Score
- Combine both into a "pulse score" per project:
  ```ts
  pulseScore = (commitsThisWeek * 1.5) + (hoursThisWeek * 2)
- Categorize into:
  - 🟢 Active
  - 🟡 Slowing
  - 🔴 Dormant

### 📊 Dashboard UI
- Display all projects
- Show:
- Name + description
- Weekly commit count
- Weekly Toggl hours
- Pulse score + health badge
- Optionally: per-project detail page

## 🧰 Tech Stack (MVP)
- Frontend: Next.js (App Router)
- Data Store:	projects.json + in-memory caching
- API Layer	GitHub + Toggl APIs via Next.js routes
- Hosting	Vercel
- No DB, no Auth, no Prisma in MVP.

## 🧠 Post-MVP Ideas
- Add auth & DB for multi-user support
- Add public mode or shareable dashboards
- Weekly reflection journal per project
- GitHub streaks / commit heatmaps
- Activity trends / burn-out detection
- Notion/Linear integration

## 🧠 Notes for AI & Future Me
This is a personal dashboard app for tracking project health via GitHub and Toggl. No users, no login, no DB yet. Projects are defined in projects.json, and live data is fetched via API.

Build this for yourself first. Future versions can scale up.