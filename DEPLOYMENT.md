# AI Hedge Fund Deployment Guide

This guide provides instructions for deploying both the frontend and backend components of the AI Hedge Fund application.

## Quick Start Deployment

The fastest way to deploy the application is through direct integration with GitHub:

1. **Frontend (Vercel)**:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Set the root directory to `web`
   - Vercel will auto-detect Next.js settings
   - Set environment variable `NEXT_PUBLIC_API_URL` to your backend URL
   - Click Deploy

2. **Backend (Railway)**:
   - Go to https://railway.app/new
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Add environment variable `ALLOWED_ORIGINS` with your frontend URL
   - Click Deploy

## Detailed Deployment Options

### Option 1: Vercel + Railway (Recommended)

#### Frontend Deployment (Vercel)

1. **Via GitHub Integration (Recommended)**:
   - Create a Vercel account at https://vercel.com
   - Connect your GitHub repository to Vercel
   - Configure your project:
     - Root Directory: `web`
     - Framework Preset: `Next.js`
     - Build Command: `npm run build`
     - Output Directory: `.next`
   - Set the following environment variables:
     - `NEXT_PUBLIC_API_URL`: Your backend API URL
   - Deploy

2. **Via Drag and Drop**:
   - Navigate to the `web` directory and build the project:
     ```
     cd web && npm run build
     ```
   - Go to https://vercel.com/new
   - Drag and drop the `.next` folder
   - Configure your project settings
   - Deploy

#### Backend Deployment (Railway)

1. **Via GitHub Integration (Recommended)**:
   - Create a Railway account at https://railway.app
   - Connect your GitHub repository
   - Configure your project:
     - Root Directory: `/` (project root)
     - Start Command: `uvicorn src.api:app --host 0.0.0.0 --port $PORT`
   - Set the following environment variables:
     - `ALLOWED_ORIGINS`: Your frontend URL (e.g., https://your-app.vercel.app)
   - Deploy

2. **Alternative: Deploy to Render**:
   - Create a Render account at https://render.com
   - Create a new Web Service and connect to your GitHub repository
   - Configure:
     - Name: `ai-hedge-fund-api`
     - Environment: `Python`
     - Build Command: `pip install -r requirements.txt`
     - Start Command: `uvicorn src.api:app --host 0.0.0.0 --port $PORT`
   - Add environment variables similar to Railway
   - Deploy

### Option 2: Docker & Cloud Provider (AWS, GCP, Azure)

For production environments, you can deploy using Docker:

1. Build the Docker images:
   ```
   docker-compose build
   ```
2. Push the images to a container registry:
   ```
   # For Docker Hub
   docker tag ai-hedge-fund-backend:latest yourusername/ai-hedge-fund-backend:latest
   docker tag ai-hedge-fund-frontend:latest yourusername/ai-hedge-fund-frontend:latest
   docker push yourusername/ai-hedge-fund-backend:latest
   docker push yourusername/ai-hedge-fund-frontend:latest
   ```
3. Deploy using your cloud provider's container service:
   - AWS: ECS, EKS or Fargate
   - GCP: GKE or Cloud Run
   - Azure: AKS or Container Instances

### Option 3: Local Deployment (Development/Testing)

Run the application locally using Docker Compose:
```
docker-compose up
```

If Docker Compose is not installed, you can run each component separately:

**Backend**:
```
cd /path/to/project
pip install -r requirements.txt
python src/start_api.py --port 8000
```

**Frontend**:
```
cd /path/to/project/web
npm install
npm run dev
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Backend (.env)
```
ALLOWED_ORIGINS=https://your-frontend-url.com
```

## CORS Configuration

The backend API is configured to handle CORS. Make sure the `ALLOWED_ORIGINS` environment variable includes your frontend URL.

## Setting up Custom Domain

### Vercel Custom Domain
1. Go to your Vercel project dashboard
2. Navigate to "Settings" > "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

### Railway Custom Domain
1. Go to your Railway project dashboard
2. Click on your service
3. Navigate to "Settings" > "Domains"
4. Add your custom domain
5. Follow the DNS configuration instructions

## Deployment Checklist

Before deploying to production:

1. Build and test the application locally
2. Configure all environment variables
3. Ensure the backend and frontend can communicate properly
4. Set up a custom domain (optional)
5. Configure SSL certificates (handled automatically by Vercel/Railway)

## Troubleshooting

1. **CORS errors**:
   - Check that `ALLOWED_ORIGINS` is set correctly in the backend
   - Verify that the frontend is using the correct backend URL

2. **API connection issues**:
   - Ensure firewalls allow traffic between frontend and backend
   - Check if service is running using health check endpoints

3. **Build failures**:
   - Verify that all dependencies are correctly specified in package.json/requirements.txt
   - Check build logs for specific error messages

## CI/CD Integration

For continuous deployment:

1. Connect your GitHub repository to Vercel and Railway
2. Configure automatic deployments for your main branch
3. Set up preview deployments for pull requests

## Monitoring and Logging

Once deployed, it's important to monitor your application:

1. **Vercel Analytics**: Available in your Vercel dashboard
2. **Railway Logs**: Check logs in the Railway dashboard
3. **Health Check Endpoints**:
   - Frontend: `/api/health`
   - Backend: `/health` 