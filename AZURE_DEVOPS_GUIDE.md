# 🚀 SRGG Marketplace - Azure DevOps CI/CD Complete Guide

## Overview

This guide walks you through setting up a complete CI/CD pipeline using Azure DevOps to deploy the SRGG Marketplace to Azure App Service.

---

## 📋 Prerequisites

Before starting, ensure you have:

- [ ] Azure DevOps account ([dev.azure.com](https://dev.azure.com))
- [ ] Azure subscription ([portal.azure.com](https://portal.azure.com))
- [ ] GitHub repository with the code

---

## 🎯 What We'll Set Up

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   GitHub     │────▶│ Azure DevOps │────▶│    Build     │────▶│ Azure App    │
│   (Code)     │     │  (Pipeline)  │     │   Artifact   │     │   Service    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

**Result:** Every push to GitHub automatically deploys to Azure.

---

## 📝 Step-by-Step Setup

### Part 1: Create Azure Resources (10 minutes)

#### Step 1.1: Log into Azure Portal

1. Go to [portal.azure.com](https://portal.azure.com)
2. Sign in with your Microsoft account

#### Step 1.2: Create a Resource Group

1. Click **"Create a resource"**
2. Search for **"Resource group"**
3. Click **Create**
4. Fill in:
   - **Subscription:** Your subscription
   - **Resource group:** `srgg-marketplace-rg`
   - **Region:** `East US` (or your preferred region)
5. Click **Review + create** → **Create**

#### Step 1.3: Create App Service Plan

1. Click **"Create a resource"**
2. Search for **"App Service Plan"**
3. Click **Create**
4. Fill in:
   - **Resource Group:** `srgg-marketplace-rg`
   - **Name:** `srgg-marketplace-plan`
   - **Operating System:** `Linux`
   - **Region:** `East US`
   - **Pricing Tier:** Click "Change size"
     - For testing: `B1` (Basic) - ~$13/month
     - For production: `P1V2` (Premium) - ~$81/month
5. Click **Review + create** → **Create**

#### Step 1.4: Create Web App (Staging)

1. Click **"Create a resource"**
2. Search for **"Web App"**
3. Click **Create**
4. Fill in:
   - **Resource Group:** `srgg-marketplace-rg`
   - **Name:** `srgg-marketplace-staging` (must be globally unique)
   - **Publish:** `Code`
   - **Runtime stack:** `Node 20 LTS`
   - **Operating System:** `Linux`
   - **Region:** `East US`
   - **App Service Plan:** `srgg-marketplace-plan`
5. Click **Review + create** → **Create**

#### Step 1.5: Create Web App (Production)

Repeat Step 1.4 with:
- **Name:** `srgg-marketplace-prod`

#### Step 1.6: Note Your App URLs

After creation, your apps will be available at:
- **Staging:** `https://srgg-marketplace-staging.azurewebsites.net`
- **Production:** `https://srgg-marketplace-prod.azurewebsites.net`

---

### Part 2: Configure Azure Web Apps (5 minutes)

#### Step 2.1: Configure Staging App

1. Go to **App Services** → **srgg-marketplace-staging**
2. Left menu → **Configuration**
3. Click **+ New application setting** and add:

| Name | Value |
|------|-------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | `your-super-secret-key-minimum-32-characters` |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` |
| `WEBSITE_NODE_DEFAULT_VERSION` | `~20` |

4. Click **Save**

#### Step 2.2: Configure Production App

Repeat for **srgg-marketplace-prod** with same settings.

#### Step 2.3: Get Publish Profiles

For **each app** (staging and production):

1. Go to **App Services** → Select your app
2. Click **"Download publish profile"** (top toolbar)
3. Save the file - you'll need its contents later

---

### Part 3: Set Up Azure DevOps (15 minutes)

#### Step 3.1: Create Azure DevOps Organization

1. Go to [dev.azure.com](https://dev.azure.com)
2. Sign in with your Microsoft account
3. If new, click **"Create new organization"**
4. Name it (e.g., `your-company-name`)

#### Step 3.2: Create a New Project

1. Click **"+ New project"**
2. Fill in:
   - **Project name:** `SRGG-Marketplace`
   - **Visibility:** `Private`
   - **Version control:** `Git`
3. Click **Create**

#### Step 3.3: Connect to GitHub Repository

1. In your project, go to **Project Settings** (bottom left gear icon)
2. Click **Service connections**
3. Click **New service connection**
4. Select **GitHub**
5. Choose **Grant authorization (OAuth)**
6. Click **Authorize**
7. **Service connection name:** `GitHub-Connection`
8. Click **Save**

#### Step 3.4: Create Azure Service Connection

1. Still in **Service connections**
2. Click **New service connection**
3. Select **Azure Resource Manager**
4. Select **Service principal (automatic)**
5. Fill in:
   - **Subscription:** Your Azure subscription
   - **Resource group:** `srgg-marketplace-rg`
   - **Service connection name:** `Azure-Connection`
6. Check **"Grant access permission to all pipelines"**
7. Click **Save**

---

### Part 4: Create the Pipeline (10 minutes)

#### Step 4.1: Create Pipeline

1. In Azure DevOps, go to **Pipelines** → **Pipelines**
2. Click **"Create Pipeline"**
3. Select **"GitHub"**
4. Authorize Azure DevOps to access GitHub if prompted
5. Select your repository: `Tatu1984/mplc`
6. Select **"Existing Azure Pipelines YAML file"**
7. Branch: `main`
8. Path: `/azure-pipelines.yml`
9. Click **Continue**

#### Step 4.2: Add Pipeline Variables

Before running, click **Variables** and add:

| Name | Value | Keep secret? |
|------|-------|--------------|
| `AzureSubscription` | `Azure-Connection` | No |
| `StagingAppName` | `srgg-marketplace-staging` | No |
| `ProductionAppName` | `srgg-marketplace-prod` | No |
| `StagingPublishProfile` | (paste contents of staging publish profile) | Yes ✓ |
| `ProductionPublishProfile` | (paste contents of production publish profile) | Yes ✓ |

#### Step 4.3: Run the Pipeline

1. Click **Run**
2. Watch the pipeline execute
3. Check each stage completes successfully

---

### Part 5: Set Up Environments & Approvals (5 minutes)

#### Step 5.1: Create Environments

1. Go to **Pipelines** → **Environments**
2. Click **New environment**
3. Create:
   - Name: `staging`
   - Description: `Staging environment`
4. Click **Create**
5. Repeat for:
   - Name: `production`
   - Description: `Production environment`

#### Step 5.2: Add Production Approval

1. Click on **production** environment
2. Click **⋮** (three dots) → **Approvals and checks**
3. Click **+ Add check** → **Approvals**
4. Add approvers (your email or team)
5. Click **Create**

Now production deployments require manual approval!

---

## 🔧 Pipeline Configuration

The `azure-pipelines.yml` file in your repo handles:

### Triggers
```yaml
trigger:
  - main      # Deploys to production
  - develop   # Deploys to staging
```

### Stages
1. **Build** - Compiles the Next.js app
2. **Deploy Staging** - Deploys develop branch
3. **Deploy Production** - Deploys main branch (with approval)

---

## 📊 Monitoring Your Deployments

### View Pipeline Runs

1. Go to **Pipelines** → **Pipelines**
2. Click on your pipeline
3. See all runs with status

### View Deployment Status

1. Go to **Pipelines** → **Environments**
2. Click on an environment
3. See deployment history

### View Application Logs

1. Go to Azure Portal → **App Services** → Your app
2. Click **Log stream** (left menu)
3. See real-time logs

---

## 🔄 How It Works

### When you push to `develop`:
```
Push → Build → Deploy to Staging → ✅ Live at staging URL
```

### When you push to `main`:
```
Push → Build → Approval Request → Approve → Deploy to Production → ✅ Live at production URL
```

---

## 🐛 Troubleshooting

### Pipeline Fails at Build

**Error:** `npm ci failed`
```
Fix: Ensure package-lock.json is committed
```

**Error:** `prisma generate failed`
```
Fix: Ensure prisma/schema.prisma exists
```

### Pipeline Fails at Deploy

**Error:** `PublishProfile is invalid`
```
Fix: Re-download publish profile from Azure Portal and update variable
```

**Error:** `Resource not found`
```
Fix: Verify app name matches exactly in variables
```

### App Shows Error After Deploy

1. Check **App Service** → **Log stream** for errors
2. Verify environment variables are set
3. Check **Configuration** → **General settings** → Node version is 20

---

## 🌐 Your URLs

After successful deployment:

| Environment | URL |
|-------------|-----|
| Staging | https://srgg-marketplace-staging.azurewebsites.net |
| Production | https://srgg-marketplace-prod.azurewebsites.net |
| Azure DevOps | https://dev.azure.com/YOUR-ORG/SRGG-Marketplace |
| GitHub | https://github.com/Tatu1984/mplc |

---

## 💰 Cost Estimate

| Resource | Tier | Monthly Cost |
|----------|------|--------------|
| App Service Plan (B1) | Basic | ~$13 |
| App Service (Staging) | Included | $0 |
| App Service (Prod) | Included | $0 |
| Azure DevOps | Free tier | $0 |
| **Total** | | **~$13/month** |

For production, upgrade to P1V2 (~$81/month) for better performance.

---

## 📞 Quick Reference Commands

### Azure CLI (Optional)

```bash
# Login to Azure
az login

# Create resource group
az group create --name srgg-marketplace-rg --location eastus

# Create App Service Plan
az appservice plan create \
  --name srgg-marketplace-plan \
  --resource-group srgg-marketplace-rg \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --name srgg-marketplace-prod \
  --resource-group srgg-marketplace-rg \
  --plan srgg-marketplace-plan \
  --runtime "NODE:20-lts"

# Set environment variables
az webapp config appsettings set \
  --name srgg-marketplace-prod \
  --resource-group srgg-marketplace-rg \
  --settings NODE_ENV=production JWT_SECRET=your-secret-key
```

---

## ✅ Setup Checklist

- [ ] Azure resource group created
- [ ] App Service Plan created
- [ ] Staging Web App created
- [ ] Production Web App created
- [ ] Environment variables configured
- [ ] Publish profiles downloaded
- [ ] Azure DevOps project created
- [ ] GitHub service connection added
- [ ] Azure service connection added
- [ ] Pipeline created and configured
- [ ] Pipeline variables added
- [ ] Environments created
- [ ] Production approval gate added
- [ ] First deployment successful

---

*Guide created for SRGG Marketplace - December 2024*
