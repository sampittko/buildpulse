# CRON Job Setup for BuildPulse

This guide explains how to set up a daily CRON job to automatically rebuild your BuildPulse data each day.

## Prerequisites

1. **API Tokens**: Make sure you have your environment variables set up:
   ```bash
   export GITHUB_TOKEN="your_github_token_here"
   export TOGGL_API_TOKEN="your_toggl_api_token_here"
   ```

2. **Dependencies**: Install tsx for running TypeScript files:
   ```bash
   npm install
   ```

## Local CRON Setup

### 1. Edit Your CRON Jobs
```bash
crontab -e
```

### 2. Add Daily Build Job
Add this line to run the build every day at 11:59 PM:
```bash
59 23 * * * cd /path/to/your/buildpulse && npm run build-data >> /tmp/buildpulse.log 2>&1
```

**Replace `/path/to/your/buildpulse`** with the actual path to your project.

### 3. Alternative: Morning Build
Or run it every morning at 6:00 AM:
```bash
0 6 * * * cd /path/to/your/buildpulse && npm run build-data >> /tmp/buildpulse.log 2>&1
```

### 4. Verify CRON Job
List your CRON jobs to verify:
```bash
crontab -l
```

## Environment Variables in CRON

CRON jobs have limited environment variables. Create a script that sources your environment:

### 1. Create a wrapper script (`scripts/cron-wrapper.sh`):
```bash
#!/bin/bash
cd /path/to/your/buildpulse
source ~/.bashrc  # or ~/.zshrc
export GITHUB_TOKEN="your_github_token_here"
export TOGGL_API_TOKEN="your_toggl_api_token_here"
npm run build-data
```

### 2. Make it executable:
```bash
chmod +x scripts/cron-wrapper.sh
```

### 3. Update CRON to use the wrapper:
```bash
59 23 * * * /path/to/your/buildpulse/scripts/cron-wrapper.sh >> /tmp/buildpulse.log 2>&1
```

## Vercel/Production Setup

For production deployment on Vercel:

### 1. **Vercel CRON Jobs**: 
   - Use Vercel CRON functions (requires Pro plan)
   - Create `api/cron/build-data.ts` endpoint

### 2. **GitHub Actions**:
   - Set up GitHub Actions to run daily
   - Use repository secrets for API tokens
   - Deploy after data build

### 3. **External CRON Service**:
   - Use services like cron-job.org or Zapier
   - Call your API endpoint daily

## Manual Testing

Test your build script manually:
```bash
npm run build-data
```

Check the generated data:
```bash
cat data/build-output.json
```

## Logs and Monitoring

- **Log file**: `/tmp/buildpulse.log`
- **View recent logs**: `tail -f /tmp/buildpulse.log`
- **Check CRON execution**: `grep CRON /var/log/syslog`

## Troubleshooting

1. **CRON not running**: Check if crond service is running
2. **API limits**: GitHub has rate limits (5000/hour with token)
3. **Permissions**: Ensure script has execute permissions
4. **Environment**: CRON has different PATH and environment variables

## CRON Schedule Examples

```bash
# Every day at midnight
0 0 * * * /path/to/script

# Every day at 6 AM
0 6 * * * /path/to/script

# Every weekday at 9 AM
0 9 * * 1-5 /path/to/script

# Every Sunday at 11 PM
0 23 * * 0 /path/to/script
``` 