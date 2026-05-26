# Render Deployment Guide

This guide walks you through deploying VoteBlock to Render.

## Prerequisites

- A [Render account](https://render.com) (free tier works)
- GitHub repository with your code pushed

## Deployment Steps

### 1. Connect Your GitHub Repository

1. Log in to [render.com](https://render.com)
2. Click **New +** → **Blueprint**
3. Connect your GitHub account if not already connected
4. Select the repository containing your VoteBlock code

### 2. Configure Environment Variables

Render will automatically detect the `render.yaml` file. Before deploying, add the required secret:

1. In the Render dashboard, go to **Dashboard** → **Environment**
2. Add the following environment variable:
   - **Key**: `JWT_SECRET`
   - **Value**: Generate a secure secret using:
     ```bash
     node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
     ```

### 3. Deploy

Click **Deploy** and Render will:
- Build the backend (compile TypeScript, install dependencies)
- Build the frontend (build React app with Vite)
- Start both services

### 4. Initialize Admin User

After deployment completes:

1. Get your backend URL from the Render dashboard
2. Make a POST request to initialize the admin user:
   ```bash
   curl -X POST https://your-backend.onrender.com/api/seed-admin
   ```
   
   Or create a script to run this automatically during deployment.

## Important Notes

### Database Persistence ⚠️

**Current Setup**: VoteBlock uses SQLite for storage. On Render's free tier, file storage is ephemeral and will be reset on deployment or service restart.

**Solutions**:

#### Option 1: Manual Restore (Temporary)
For development/testing, data will reset on each deploy. This is acceptable for demo purposes.

#### Option 2: PostgreSQL (Recommended)
Migrate to PostgreSQL for persistent storage:
1. Provision a PostgreSQL instance on Render
2. Update the backend to use PostgreSQL
3. Create database migrations

**Contact for help setting up PostgreSQL migration.**

### Service URLs

After deployment, your services will be available at:

- **Backend**: `https://voteblock-backend.onrender.com`
- **Frontend**: `https://voteblock-frontend.onrender.com`

The frontend is automatically configured to use the backend API.

### Free Tier Limitations

- Services spin down after 15 minutes of inactivity
- 100-hour/month free compute time per service
- After free hours are used, services are paused until next month

## Monitoring & Logs

View logs for each service:
1. Go to **Dashboard**
2. Select the service (backend or frontend)
3. Click **Logs** to see real-time logs

## Troubleshooting

### Backend fails to start
- Check logs: `npm run start` command
- Verify `JWT_SECRET` is set as a secret (not environment variable)
- Ensure TypeScript compilation succeeds: `npm run build`

### Frontend not connecting to backend
- Verify `VITE_API_URL` in render.yaml points to correct backend URL
- Check CORS is configured correctly in backend

### Health check failing
- Backend should respond to `GET /api/health` with `{ status: "ok" }`
- Check backend logs for errors

## Redeploying

To redeploy after code changes:
1. Push changes to GitHub
2. Render automatically rebuilds and deploys
3. Or manually trigger from Render dashboard: **Service** → **Deploys** → **Deploy**
