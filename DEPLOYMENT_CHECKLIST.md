# VoteBlock Render Deployment Checklist

Complete this checklist before deploying to Render.

## Pre-Deployment

- [ ] All code is committed to GitHub
- [ ] No sensitive credentials are in the codebase (use environment variables)
- [ ] `.env` files are in `.gitignore` (they should be)
- [ ] TypeScript compiles without errors: `npm run build` (from backend/)
- [ ] Frontend builds without errors: `npm run build` (from frontend/)
- [ ] Tests pass: `npm run test` (from backend/)

## Render Setup

### 1. GitHub Connection
- [ ] You have a Render account (render.com)
- [ ] You've authorized Render to access your GitHub account
- [ ] Your repository is accessible to Render

### 2. Environment Variables
- [ ] Generate a secure JWT_SECRET:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- [ ] Save the JWT_SECRET somewhere safe (you'll need it)
- [ ] You're ready to add it as a Render secret during deployment

### 3. Deployment Configuration
- [ ] `render.yaml` exists in the root directory ✓
- [ ] `render.yaml` has correct service names
- [ ] `.renderignore` file exists ✓
- [ ] Backend `package.json` has `start` script ✓
- [ ] Backend `package.json` has `build` script ✓
- [ ] Frontend `package.json` has `build` script ✓

## Render Deployment

### Step 1: Create Blueprint
1. [ ] Go to https://render.com/dashboard
2. [ ] Click **New +** → **Blueprint**
3. [ ] Select your GitHub repository containing VoteBlock
4. [ ] Render will automatically detect `render.yaml`

### Step 2: Add Environment Secret
1. [ ] Click **Environment** tab
2. [ ] Click **Add Secret**
3. [ ] Name: `JWT_SECRET`
4. [ ] Value: [Your generated JWT secret from above]
5. [ ] Save

### Step 3: Deploy
1. [ ] Review the service configuration
2. [ ] Click **Deploy**
3. [ ] Wait for both services to build (10-15 minutes typical)
4. [ ] Watch the logs for any errors

### Step 4: Initialize Admin User
1. [ ] After both services show "Live" status
2. [ ] Get your backend URL from the Render dashboard (e.g., `https://voteblock-backend-abc123.onrender.com`)
3. [ ] Open a terminal and run:
   ```bash
   curl -X POST https://YOUR-BACKEND-URL.onrender.com/api/init
   ```
   Replace `YOUR-BACKEND-URL` with your actual backend URL
4. [ ] You should get a response with admin credentials

### Step 5: Verify
1. [ ] Visit your frontend URL (from Render dashboard)
2. [ ] You should see the VoteBlock app loading
3. [ ] Try logging in with admin credentials:
   - Email: `admin@voteblock.com`
   - Password: `admin123!`
4. [ ] Test creating a poll
5. [ ] Test voting on a poll

## Post-Deployment

- [ ] Change admin password immediately!
- [ ] Review Render logs for any warnings
- [ ] Test all major features (create poll, vote, view admin dashboard)
- [ ] Monitor the backend and frontend services for errors

## URLs After Deployment

- **Frontend**: `https://voteblock-frontend.onrender.com` (or your custom domain)
- **Backend API**: `https://voteblock-backend.onrender.com/api`
- **Health Check**: `https://voteblock-backend.onrender.com/api/health`

## Troubleshooting

### Backend build fails
- Check that `npm run build` works locally
- Verify all dependencies are in `package.json`
- Check the Render build logs for specific errors

### Frontend not loading
- Verify `VITE_API_URL` is correctly set to backend URL
- Check browser console for any errors
- Ensure CORS is configured in backend

### Admin initialization fails
- Verify backend is running (check Render logs)
- Confirm you're using the correct backend URL
- Try manually creating an admin user in the database

### Database errors
- Note: SQLite data persists only within a deployment
- On service restart or new deployment, data resets
- For persistent data, migrate to PostgreSQL

## Further Configuration

### Custom Domain
- In Render dashboard → Settings → Custom Domain
- Follow Render's DNS instructions

### Auto-Deploy on Push
- Already enabled! Push to main/master branch triggers new deployment

### Monitoring
- Render provides free monitoring and logs
- Check Render dashboard → Logs for real-time service activity

## Support

- Render Docs: https://render.com/docs
- GitHub Issues: Add in your repository

---

✅ You're ready to deploy! Follow the steps above and your VoteBlock app will be live on the internet.
