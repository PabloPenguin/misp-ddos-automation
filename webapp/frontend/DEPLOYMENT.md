# MISP DDoS Automation - Frontend Deployment Guide

This guide explains how to deploy the MISP DDoS Automation frontend web application to GitHub Pages.

## Prerequisites

1. **GitHub Repository**: Ensure your repository is pushed to GitHub
2. **Node.js**: Version 16 or higher installed locally
3. **Git**: For version control

## Deployment Steps

### 1. Install Dependencies & Build

First, navigate to the frontend directory and install dependencies:

```bash
cd webapp/frontend
npm install
```

Build the application for production:

```bash
npm run build
```

### 2. Enable GitHub Pages

1. Go to your GitHub repository
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **Deploy from a branch**
5. Choose **gh-pages** branch and **/ (root)** folder
6. Click **Save**

### 3. Deploy to GitHub Pages

Use the built-in deployment script:

```bash
npm run deploy
```

This command will:
- Build the application
- Create/update the `gh-pages` branch
- Push the built files to GitHub Pages

### 4. Configure Repository Settings

If this is your first deployment, you may need to:

1. Wait 5-10 minutes for the initial deployment
2. Your site will be available at: `https://[username].github.io/[repository-name]/`
3. Update the `vite.config.ts` base path if your repository name differs

### 5. Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file in the `public/` directory with your domain
2. Configure DNS settings with your domain provider
3. Enable HTTPS in GitHub Pages settings

## Configuration Files

### `vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/misp-ddos-automation/', // Update this to match your repo name
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
```

### `package.json` Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

## Automated Deployment with GitHub Actions

For automatic deployment on every push, create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
    paths: [ 'webapp/frontend/**' ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: 'webapp/frontend/package-lock.json'
        
    - name: Install dependencies
      run: |
        cd webapp/frontend
        npm ci
        
    - name: Build
      run: |
        cd webapp/frontend
        npm run build
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: webapp/frontend/dist
```

## Troubleshooting

### Common Issues

1. **404 Error on Refresh**
   - GitHub Pages doesn't support client-side routing by default
   - The `404.html` file is included to handle this

2. **Assets Not Loading**
   - Verify the `base` path in `vite.config.ts` matches your repository name
   - Check that assets are correctly referenced

3. **Build Fails**
   - Ensure all dependencies are installed: `npm install`
   - Check for TypeScript errors: `npm run build`

4. **Deployment Fails**
   - Verify GitHub Pages is enabled in repository settings
   - Check repository permissions and branch protection rules

### Environment Variables

For production deployment, you may need to set environment variables:

Create `.env.production`:
```
VITE_MISP_API_URL=https://your-misp-instance.com
VITE_GITHUB_REPO=your-username/your-repo-name
```

## Features Available

The deployed web application includes:

- **Upload Page**: Drag-and-drop file upload for CSV/JSON DDoS data
- **Dashboard**: Overview of MISP events and system status
- **Events Page**: Browse and manage created MISP events
- **Settings Page**: Configure MISP connection and preferences

## Local Development

To run the application locally:

```bash
cd webapp/frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
webapp/frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable React components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── App.tsx         # Main application component
├── package.json        # Project dependencies and scripts
├── vite.config.ts     # Vite configuration
└── tsconfig.json      # TypeScript configuration
```

## Support

For issues with deployment:
1. Check GitHub Pages build logs in the Actions tab
2. Verify all configuration files are correct
3. Ensure the repository is public (or GitHub Pro for private repos)

## Next Steps

After successful deployment:
1. Test all features in the deployed environment
2. Configure MISP API endpoints for production
3. Set up monitoring and error tracking
4. Consider implementing CI/CD for automated updates