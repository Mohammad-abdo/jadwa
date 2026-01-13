# Jadwa Consulting Platform - Vercel Deployment Guide

## Prerequisites
- Node.js 18+ installed
- Vercel account
- Backend API URL

## Environment Variables

Before deploying to Vercel, make sure to set these environment variables in Vercel dashboard:

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add the following variables:

```
VITE_API_URL=https://your-backend-api-url.com/api
```

**Important:** Replace `https://your-backend-api-url.com/api` with your actual backend API URL.

## Build Commands

The project uses Vite for building:

```bash
npm install
npm run build
```

The build output will be in the `dist` folder.

## Deployment Steps

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
cd front-end
vercel
```

4. For production:
```bash
vercel --prod
```

### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Add environment variables
5. Deploy

## Important Notes

- Make sure your backend API is deployed and accessible
- Update `VITE_API_URL` environment variable with your backend URL
- The build creates optimized production files in the `dist` folder
- Vercel will automatically handle routing for React Router

## Troubleshooting

If you encounter issues:
1. Check that all environment variables are set correctly
2. Verify the backend API URL is accessible
3. Check Vercel build logs for errors
4. Ensure Node.js version is 18 or higher

