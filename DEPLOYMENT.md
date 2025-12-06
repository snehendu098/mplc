# SRGG Marketplace - Deployment Guide

## Azure DevOps CI/CD Setup

### Prerequisites
1. Azure DevOps account with a project
2. Azure subscription with:
   - Azure Container Registry (ACR)
   - Azure App Service OR Azure Container Apps
3. Service connections configured in Azure DevOps

---

## Option 1: Azure App Service Deployment

### Step 1: Create Azure Resources
```bash
# Create resource group
az group create --name srgg-marketplace-rg --location eastus

# Create App Service Plan
az appservice plan create \
  --name srgg-marketplace-plan \
  --resource-group srgg-marketplace-rg \
  --sku B1 \
  --is-linux

# Create Web App (Staging)
az webapp create \
  --name srgg-marketplace-staging \
  --resource-group srgg-marketplace-rg \
  --plan srgg-marketplace-plan \
  --runtime "NODE:20-lts"

# Create Web App (Production)
az webapp create \
  --name srgg-marketplace-prod \
  --resource-group srgg-marketplace-rg \
  --plan srgg-marketplace-plan \
  --runtime "NODE:20-lts"
```

### Step 2: Configure Azure DevOps

1. **Create Service Connection:**
   - Go to Project Settings > Service Connections
   - Add "Azure Resource Manager" connection
   - Select your subscription
   - Name it: `AzureSubscription`

2. **Create Pipeline Variables:**
   - `AzureSubscription`: Your service connection name
   - `StagingAppName`: `srgg-marketplace-staging`
   - `ProductionAppName`: `srgg-marketplace-prod`

3. **Create Pipeline:**
   - Go to Pipelines > New Pipeline
   - Select your repository
   - Choose "Existing Azure Pipelines YAML file"
   - Select `/azure-pipelines.yml`

4. **Create Environments:**
   - Go to Pipelines > Environments
   - Create `staging` environment
   - Create `production` environment (add approval check)

---

## Option 2: Docker/Container Deployment (Recommended)

### Step 1: Create Azure Container Registry
```bash
# Create ACR
az acr create \
  --name srggmarketplaceacr \
  --resource-group srgg-marketplace-rg \
  --sku Basic \
  --admin-enabled true
```

### Step 2: Create Azure Container Apps
```bash
# Create Container Apps Environment
az containerapp env create \
  --name srgg-marketplace-env \
  --resource-group srgg-marketplace-rg \
  --location eastus

# Create Container App (Staging)
az containerapp create \
  --name srgg-marketplace-staging \
  --resource-group srgg-marketplace-rg \
  --environment srgg-marketplace-env \
  --image srggmarketplaceacr.azurecr.io/srgg-marketplace:latest \
  --target-port 3000 \
  --ingress external \
  --registry-server srggmarketplaceacr.azurecr.io \
  --min-replicas 1 \
  --max-replicas 3

# Create Container App (Production)
az containerapp create \
  --name srgg-marketplace-prod \
  --resource-group srgg-marketplace-rg \
  --environment srgg-marketplace-env \
  --image srggmarketplaceacr.azurecr.io/srgg-marketplace:latest \
  --target-port 3000 \
  --ingress external \
  --registry-server srggmarketplaceacr.azurecr.io \
  --min-replicas 2 \
  --max-replicas 10
```

### Step 3: Configure Azure DevOps for Docker

1. **Create Docker Registry Service Connection:**
   - Project Settings > Service Connections
   - Add "Docker Registry"
   - Select "Azure Container Registry"
   - Name it: `AzureContainerRegistry`

2. **Create Pipeline Variables:**
   - `ACR_NAME`: `srggmarketplaceacr`
   - `ResourceGroup`: `srgg-marketplace-rg`
   - `AzureSubscription`: Your ARM service connection

3. **Create Pipeline:**
   - Use `/azure-pipelines-docker.yml`

---

## Environment Variables

Configure these in Azure Portal or via CLI:

```bash
# For App Service
az webapp config appsettings set \
  --name srgg-marketplace-prod \
  --resource-group srgg-marketplace-rg \
  --settings \
    NODE_ENV=production \
    DATABASE_URL="your-production-database-url" \
    JWT_SECRET="your-secure-jwt-secret"

# For Container Apps
az containerapp update \
  --name srgg-marketplace-prod \
  --resource-group srgg-marketplace-rg \
  --set-env-vars \
    NODE_ENV=production \
    DATABASE_URL="your-production-database-url" \
    JWT_SECRET="your-secure-jwt-secret"
```

---

## Local Docker Testing

```bash
# Build and run locally
docker-compose up --build web

# Or build just the web app
docker build -t srgg-marketplace .
docker run -p 3000:3000 srgg-marketplace
```

---

## Pipeline Files

| File | Purpose |
|------|---------|
| `azure-pipelines.yml` | App Service deployment (simpler) |
| `azure-pipelines-docker.yml` | Container deployment (recommended) |
| `Dockerfile` | Multi-stage production build |
| `docker-compose.yml` | Full stack local development |
| `.dockerignore` | Files excluded from Docker build |

---

## Sharing with Client

Once deployed, share the URL:
- **Staging:** `https://srgg-marketplace-staging.azurewebsites.net`
- **Production:** `https://srgg-marketplace-prod.azurewebsites.net`

Or for Container Apps:
- URLs provided after deployment via `az containerapp show`

---

## Quick Start Checklist

- [ ] Create Azure resource group
- [ ] Create App Service/Container Apps
- [ ] Create Azure Container Registry (for Docker)
- [ ] Configure service connections in Azure DevOps
- [ ] Add pipeline variables
- [ ] Create staging and production environments
- [ ] Add approval gate for production
- [ ] Push code to trigger pipeline
- [ ] Verify deployment
