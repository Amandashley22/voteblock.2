# 🚀 Render Deployment - Quick Start

Your VoteBlock app is now ready to deploy to Render! Here's what's been set up:

## What's Been Configured

✅ **render.yaml** - Deployment configuration for both backend and frontend  
✅ **Health check endpoint** - `/api/health` for Render monitoring  
✅ **Admin initialization endpoint** - `/api/init` to create admin user after deployment  
✅ **Environment configuration** - Ready for Render secrets  
✅ **Documentation** - Complete guides for deployment and troubleshooting  

## Quick Start (5 minutes)

### 1. Generate JWT Secret
Run this command and save the output:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Push to GitHub
```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### 3. Deploy on Render
1. Go to https://render.com/dashboard
2. Click **New +** → **Blueprint**
3. Select your GitHub repository
4. When prompted, add `JWT_SECRET` environment secret (use value from step 1)
5. Click **Deploy**

### 4. Initialize Admin User (after deployment completes)
Get your backend URL from Render dashboard, then:
```bash
curl -X POST https://YOUR-BACKEND-URL.onrender.com/api/init
```

### 5. Login
- Frontend: `https://voteblock-frontend.onrender.com`
- Admin Email: `admin@voteblock.com`
- Admin Password: `admin123!`

⚠️ **Change the admin password immediately after first login!**

## Files Added/Modified

| File | Purpose |
|------|---------|
| `render.yaml` | Deployment configuration for Render |
| `.renderignore` | Files to exclude from Render deployment |
| `RENDER_DEPLOYMENT.md` | Detailed deployment guide |
| `DEPLOYMENT_CHECKLIST.md` | Pre/post deployment checklist |
| `DEPLOY_TO_RENDER.sh` | Quick reference script |
| `backend/src/index.ts` | Added health check & admin init endpoints |

## Architecture

```
┌─────────────────────────────────────────┐
│         Your VoteBlock App              │
├─────────────────────────────────────────┤
│  Frontend (React + Vite)                │  → Hosted as Static Site
│  - Compiled to dist/                    │
│  - Served from Render                   │
├─────────────────────────────────────────┤
│  Backend (Node.js + Express)            │  → Hosted as Web Service
│  - Built with TypeScript                │
│  - API at /api/...                      │
│  - SQLite database (local)              │
└─────────────────────────────────────────┘
```

## Important Notes

### Database
- Currently uses SQLite (local file)
- Data persists during a deployment but resets on service restart
- For production, consider migrating to PostgreSQL

### First Time Setup
- Admin user must be created via `/api/init` endpoint
- This endpoint only works once (if no admin exists)
- All subsequent admin users created through the app

### Auto-Deployments
- Render automatically deploys when you push to GitHub main branch
- No manual deploy needed for future updates

## Environment Variables (Already Set)

| Variable | Value | Type |
|----------|-------|------|
| `NODE_ENV` | `production` | Plain |
| `PORT` | `4000` | Plain |
| `JWT_SECRET` | [Your generated secret] | **Secret** |
| `CORS_ORIGIN` | `https://voteblock-frontend.onrender.com` | Plain |
| `VITE_API_URL` | `https://voteblock-backend.onrender.com/api` | Plain |

## Monitoring

After deployment, you can monitor your services:
- Go to Render Dashboard
- Select each service (backend, frontend)
- View **Logs** for real-time activity
- Set up email alerts for deployment failures

## URLs (After Deployment)

- **Frontend**: `https://voteblock-frontend.onrender.com`
- **Backend API**: `https://voteblock-backend.onrender.com/api`
- **Health Check**: `https://voteblock-backend.onrender.com/api/health`

## Troubleshooting

**Issue: Admin init returns "Admin user already exists"**  
→ Admin was already created. You can reset by accessing the Render database console.

**Issue: Frontend can't connect to backend**  
→ Check that `VITE_API_URL` in render.yaml matches your actual backend URL

**Issue: Services won't start**  
→ Check Render logs for specific errors. Common issues:
- Missing `npm` scripts
- TypeScript compilation errors
- Missing environment variables

## Next Steps

1. ✅ Push code to GitHub (with render.yaml)
2. ✅ Go to Render and create Blueprint
3. ✅ Add JWT_SECRET secret
4. ✅ Click Deploy
5. ✅ Wait for services to go "Live" (5-10 minutes)
6. ✅ Initialize admin user via `/api/init`
7. ✅ Access your app at frontend URL
8. ✅ Login and test features

## Questions?

- **Render Docs**: https://render.com/docs
- **VoteBlock Setup**: See `SETUP.md`
- **Render Issues**: Check service logs in Render dashboard

---

Good luck with your deployment! 🎉
