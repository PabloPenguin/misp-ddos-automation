# 🎨 MISP DDoS Dashboard - Frontend

A modern, cybersecurity-themed React dashboard for visualizing DDoS threat intelligence from MISP instances. Features interactive charts, responsive design, and TLP-compliant security filtering.

![React](https://img.shields.io/badge/React-18+-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)
![Material-UI](https://img.shields.io/badge/Material--UI-5+-0081CB)
![Security](https://img.shields.io/badge/Security-TLP%20Compliant-red)

### 📁 Complete Project Structure
```
webapp/frontend/
├── public/
│   ├── 404.html                 # GitHub Pages routing support
│   └── vite.svg                 # App icon
├── src/
│   ├── components/
│   │   ├── Header.tsx           # Navigation header with GitHub link
│   │   └── Sidebar.tsx          # Navigation sidebar
│   ├── pages/
│   │   ├── DashboardPage.tsx    # Overview with stats and activity
│   │   ├── UploadPage.tsx       # Drag-and-drop file upload
│   │   ├── EventsPage.tsx       # MISP events table and management
│   │   └── SettingsPage.tsx     # Configuration and preferences
│   ├── types/
│   │   └── index.ts             # TypeScript definitions
│   ├── App.tsx                  # Main application with routing
│   ├── main.tsx                 # React entry point
│   └── index.css                # Global styles
├── .github/workflows/
│   └── deploy-frontend.yml      # GitHub Actions deployment
├── index.html                   # Main HTML with SPA routing
├── package.json                 # Dependencies and scripts
├── vite.config.ts              # Build configuration
├── tsconfig.json               # TypeScript configuration
└── DEPLOYMENT.md               # Comprehensive deployment guide
```

### 🚀 Key Features

1. **Dashboard Page**
   - System statistics and KPIs
   - Recent activity feed
   - Quick action buttons
   - System status indicators

2. **Upload Page**
   - Drag-and-drop file upload
   - File validation (CSV/JSON, 50MB limit)
   - Upload progress tracking
   - Upload history with status

3. **Events Page**
   - MISP events table with search/filter
   - Event details modal
   - Direct links to MISP instance
   - Pagination and export options

4. **Settings Page**
   - MISP connection configuration
   - Event creation preferences
   - Custom tags management
   - System information panel

### 🛠 Technology Stack

- **React 18** with TypeScript for type safety
- **Material-UI (MUI) v5** for modern, responsive UI components
- **Vite** for fast development and optimized builds
- **React Router** for client-side routing
- **React Dropzone** for file upload functionality
- **GitHub Pages** deployment with automated CI/CD

## 🚀 How to Deploy to GitHub Pages

### Prerequisites
You'll need to install Node.js first:
1. Download Node.js (v18 or higher) from https://nodejs.org/
2. Install it on your system
3. Restart your terminal/command prompt

### Deployment Steps

1. **Install Dependencies**
   ```bash
   cd webapp/frontend
   npm install
   ```

2. **Test Build Locally**
   ```bash
   npm run build
   npm run preview
   ```

3. **Deploy to GitHub Pages**
   ```bash
   npm run deploy
   ```

4. **Enable GitHub Pages**
   - Go to your GitHub repository settings
   - Navigate to "Pages" section
   - Set source to "Deploy from a branch"
   - Select "gh-pages" branch
   - Your site will be live at: `https://[username].github.io/[repo-name]/`

### Automated Deployment
The GitHub Actions workflow is already configured! Every time you push changes to the `webapp/frontend/` directory, it will automatically:
- Build the React application
- Deploy to GitHub Pages
- Update your live site

## 🎯 Project Status

### ✅ Completed Features
- [x] Galaxy Cluster integration working (Event ID 1658 confirmed)
- [x] CLI tool v1.0.0 fully operational
- [x] Complete React frontend with all 4 pages
- [x] GitHub Pages deployment configuration
- [x] Automated CI/CD pipeline
- [x] Comprehensive documentation

### 📋 Next Steps
1. Install Node.js on your system
2. Run the deployment commands above
3. Test the live web application
4. Configure MISP API endpoints for production use
5. Customize the design and add your branding

## 🔧 Configuration Notes

- **Repository Name**: Update `vite.config.ts` base path if your repo name differs from "misp-ddos-automation"
- **MISP Instance**: Update the MISP URL in the settings page and throughout the code
- **GitHub Links**: The header component links to your GitHub repository automatically

## 📚 Documentation

- `DEPLOYMENT.md` - Complete deployment guide with troubleshooting
- `README.md` - Project overview and getting started
- Inline code comments explain complex functionality
- TypeScript types provide development guidance

## 🎨 Design Features

- Responsive design works on desktop, tablet, and mobile
- Dark/light theme support through Material-UI
- Consistent color scheme and typography
- Intuitive navigation with sidebar and header
- Professional data tables and forms
- Loading states and error handling
- Accessibility features built-in

The frontend is now ready for deployment and provides a complete web interface for your MISP DDoS automation system! 🚀