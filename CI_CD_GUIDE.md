# 🚀 SRGG Marketplace - CI/CD Setup Guide

## Overview

This guide explains how to set up automated deployments for the SRGG Marketplace using GitHub Actions. Every time you push code to the repository, it will automatically build and deploy your application.

---

## 📋 Table of Contents

1. [Quick Start (5 minutes)](#-quick-start-with-vercel)
2. [Understanding the Pipeline](#-understanding-the-pipeline)
3. [Deployment Options](#-deployment-options)
4. [Step-by-Step Setup](#-step-by-step-setup)
5. [Environment Variables](#-environment-variables)
6. [Troubleshooting](#-troubleshooting)

---

## ⚡ Quick Start with Vercel

**Fastest way to get your app live in 5 minutes:**

### Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **"Add New Project"**
3. Import your GitHub repository: `Tatu1984/mplc`
4. Click **Deploy**

That's it! Vercel will automatically deploy on every push.

### Step 2: Get Your Live URL

After deployment, you'll get a URL like:
```
https://mplc-xxxx.vercel.app
```

Share this with your clients!

---

## 🔄 Understanding the Pipeline

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Developer │────▶│   GitHub    │────▶│  Deployed   │
│  Pushes Code│     │   Actions   │     │    App      │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │  Automatic  │
                    │   Build &   │
                    │    Test     │
                    └─────────────┘
```

### What Happens on Every Push:

1. **Build** - Compiles the Next.js application
2. **Test** - Runs any tests (if configured)
3. **Deploy** - Pushes to your hosting platform
4. **Notify** - Shows deployment status in GitHub

---

## 🌐 Deployment Options

| Platform | Best For | Pricing | Setup Time |
|----------|----------|---------|------------|
| **Vercel** ⭐ | Next.js apps | Free tier available | 5 min |
| **Railway** | Full-stack with DB | $5/month | 10 min |
| **Render** | Docker containers | Free tier available | 15 min |
| **Netlify** | Static sites | Free tier available | 5 min |

**Recommendation:** Start with Vercel for the easiest setup.

---

## 📝 Step-by-Step Setup

### Option A: Vercel (Recommended)

#### 1. Create Vercel Account
- Go to [vercel.com/signup](https://vercel.com/signup)
- Sign up with your GitHub account

#### 2. Import Project
- Click **"Add New → Project"**
- Select the `mplc` repository
- Click **"Deploy"**

#### 3. Configure GitHub Secrets (for CI/CD)

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**

Add these secrets:

| Secret Name | How to Get It |
|-------------|---------------|
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) → Create Token |
| `VERCEL_ORG_ID` | Run `vercel whoami` or check project settings |
| `VERCEL_PROJECT_ID` | In Vercel dashboard → Project → Settings → General |

#### 4. Test the Pipeline
- Make a small change to any file
- Commit and push to GitHub
- Go to **Actions** tab to see the pipeline run

---

### Option B: Railway

#### 1. Create Railway Account
- Go to [railway.app](https://railway.app)
- Sign up with GitHub

#### 2. Create New Project
- Click **"New Project"**
- Select **"Deploy from GitHub repo"**
- Choose `mplc`

#### 3. Add Database (Optional)
- Click **"+ New"** → **"Database"** → **"PostgreSQL"**
- Railway auto-configures the connection

#### 4. Configure GitHub Secret

| Secret Name | How to Get It |
|-------------|---------------|
| `RAILWAY_TOKEN` | [railway.app/account/tokens](https://railway.app/account/tokens) |

#### 5. Enable in Pipeline

Go to GitHub repo → **Settings** → **Variables** → **Actions**

Add variable:
- Name: `USE_RAILWAY`
- Value: `true`

---

### Option C: Render

#### 1. Create Render Account
- Go to [render.com](https://render.com)
- Sign up with GitHub

#### 2. Create Web Service
- Click **"New +"** → **"Web Service"**
- Connect your GitHub repo
- Configure:
  - **Environment:** Node
  - **Build Command:** `npm install && npm run build`
  - **Start Command:** `npm start`

#### 3. Get Deploy Hook

- Go to your service → **Settings** → **Deploy Hook**
- Copy the URL

#### 4. Configure GitHub Secret

| Secret Name | Value |
|-------------|-------|
| `RENDER_DEPLOY_HOOK_URL` | Your deploy hook URL |

---

## 🔐 Environment Variables

### Required for Production

Add these in your hosting platform:

```env
# Database (if using external DB)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Authentication
JWT_SECRET=your-super-secret-key-min-32-chars

# Optional
NODE_ENV=production
```

### How to Add in Each Platform

**Vercel:**
- Project → Settings → Environment Variables

**Railway:**
- Project → Variables tab

**Render:**
- Service → Environment tab

---

## 🔍 Monitoring Your Deployments

### GitHub Actions Dashboard

1. Go to your repo: `github.com/Tatu1984/mplc`
2. Click **"Actions"** tab
3. See all pipeline runs

### Understanding Status Icons

| Icon | Meaning |
|------|---------|
| ✅ Green | Deployment successful |
| ❌ Red | Deployment failed - check logs |
| 🟡 Yellow | In progress |
| ⚪ Gray | Skipped |

### Viewing Logs

1. Click on any workflow run
2. Click on the failed job
3. Expand steps to see detailed logs

---

## 🔧 Troubleshooting

### Build Fails

**Error:** `npm ci failed`
```
Solution: Delete package-lock.json and run npm install locally, then push again
```

**Error:** `Prisma generate failed`
```
Solution: Ensure prisma/schema.prisma exists and is valid
```

### Deployment Fails

**Error:** `VERCEL_TOKEN is not set`
```
Solution: Add the VERCEL_TOKEN secret in GitHub Settings → Secrets
```

**Error:** `Permission denied`
```
Solution: Check that GitHub Actions has write permissions:
Settings → Actions → General → Workflow permissions → Read and write
```

### App Not Working After Deploy

1. Check environment variables are set
2. Verify database connection string
3. Check the platform logs (Vercel/Railway/Render dashboard)

---

## 📊 Pipeline Features

### Automatic Triggers

| Event | Action |
|-------|--------|
| Push to `main` | Deploy to Production |
| Push to `develop` | Deploy to Preview/Staging |
| Pull Request | Build only (no deploy) |

### Manual Deployment

1. Go to **Actions** tab
2. Select **"🚀 CI/CD Pipeline"**
3. Click **"Run workflow"**
4. Choose environment and run

---

## 🐳 Docker Deployment

Every push to `main` also builds a Docker image available at:

```
ghcr.io/tatu1984/mplc:latest
```

To run locally:
```bash
docker pull ghcr.io/tatu1984/mplc:latest
docker run -p 3000:3000 ghcr.io/tatu1984/mplc:latest
```

---

## 📞 Support

If you encounter issues:

1. Check the [GitHub Actions logs](https://github.com/Tatu1984/mplc/actions)
2. Review this guide's Troubleshooting section
3. Contact the development team

---

## 🎯 Quick Reference

### GitHub Secrets Needed

| Secret | Platform | Required |
|--------|----------|----------|
| `VERCEL_TOKEN` | Vercel | Yes (if using Vercel) |
| `VERCEL_ORG_ID` | Vercel | Yes (if using Vercel) |
| `VERCEL_PROJECT_ID` | Vercel | Yes (if using Vercel) |
| `RAILWAY_TOKEN` | Railway | Yes (if using Railway) |
| `RENDER_DEPLOY_HOOK_URL` | Render | Yes (if using Render) |

### URLs After Setup

- **GitHub Repo:** https://github.com/Tatu1984/mplc
- **Actions:** https://github.com/Tatu1984/mplc/actions
- **Docker Image:** ghcr.io/tatu1984/mplc:latest

---

*Last updated: December 2024*
