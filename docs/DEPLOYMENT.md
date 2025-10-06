# 🚀 Deployment Guide

Complete deployment guide for the MISP DDoS Automation Suite, covering GitHub Actions setup, GitHub Pages deployment, and production configuration.

## 📋 Prerequisites

### Required Accounts & Access
- **GitHub Account**: With repository creation permissions
- **MISP Instance**: Running instance with API access
- **Domain Access**: For custom domain setup (optional)

### Required Information
- **MISP URL**: `https://your-misp-instance.com`
- **MISP API Key**: Generate from MISP user settings
- **SSL Configuration**: Certificate validation requirements

## 🔧 Initial Setup

### 1. Repository Configuration

#### Fork or Clone Repository
```bash
# Clone the repository
git clone https://github.com/PabloPenguin/misp-ddos-automation.git
cd misp-ddos-automation

# Or fork on GitHub and clone your fork
git clone https://github.com/YOUR_USERNAME/misp-ddos-automation.git
```

#### Enable GitHub Pages
1. Go to repository **Settings** → **Pages**
2. **Source**: Select "GitHub Actions"
3. **Custom domain** (optional): Enter your domain
4. Click **Save**

### 2. GitHub Secrets Configuration

Navigate to **Settings** → **Secrets and variables** → **Actions**

#### Required Secrets
```bash
# MISP Connection
MISP_URL = https://server1.tailaa85d9.ts.net
MISP_API_KEY = your_misp_api_key_here
MISP_VERIFY_SSL = false  # Set to true for valid SSL certificates

# Optional: Advanced Configuration
MISP_TIMEOUT = 30
MISP_MAX_RETRIES = 3
```

**🔒 Security Note**: Never commit these values to your repository!

### 3. Workflow Permissions

#### Configure Repository Permissions
1. Go to **Settings** → **Actions** → **General**
2. **Workflow permissions**: Select "Read and write permissions"
3. **Allow GitHub Actions to create and approve pull requests**: ✅ Enable
4. Click **Save**

## ⚙️ GitHub Actions Workflow

### Automated Workflow Features
The deployment includes a comprehensive GitHub Actions workflow that:

- **Scheduled Execution**: Runs every 30 minutes during business hours
- **Manual Triggers**: Available via "Run workflow" button
- **Error Handling**: Robust retry logic and error reporting
- **Security**: TLP:RED filtering and input validation
- **Deployment**: Automatic GitHub Pages deployment

### Workflow Configuration

#### Schedule Settings
```yaml
on:
  schedule:
    # Business hours: Every 30 minutes (8 AM - 6 PM UTC)
    - cron: '*/30 8-18 * * 1-5'
    # Off-hours: Every 2 hours
    - cron: '0 */2 * * *'
  workflow_dispatch: # Manual trigger
  push:
    branches: [ main ]
```

#### Environment Variables
```yaml
env:
  MISP_URL: ${{ secrets.MISP_URL }}
  MISP_API_KEY: ${{ secrets.MISP_API_KEY }}
  MISP_VERIFY_SSL: ${{ secrets.MISP_VERIFY_SSL }}
```

### Workflow Steps Explained

#### 1. Environment Setup
```yaml
- name: Set up Python
  uses: actions/setup-python@v5
  with:
    python-version: '3.11'
    cache: 'pip'
```

#### 2. Dependency Installation
```yaml
- name: Install CLI dependencies
  run: |
    cd cli
    pip install -r requirements.txt
```

#### 3. MISP Connection Validation
```yaml
- name: Verify MISP connection
  run: |
    cd cli
    python src/misp_client.py --test-connection
```

#### 4. Data Generation
```yaml
- name: Fetch MISP events data (Non TLP:RED)
  run: |
    cd cli
    python src/misp_client.py --fetch-dashboard-data --output ../webapp/frontend/public/data/dashboard-data.json
```

#### 5. Git Operations
```yaml
- name: Commit and push updated data
  run: |
    git config --local user.email "action@github.com"
    git config --local user.name "GitHub Action"
    git add webapp/frontend/public/data/
    git diff --staged --quiet || git commit -m "Update MISP dashboard data - $TIMESTAMP"
    git push
```

#### 6. GitHub Pages Deployment
```yaml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./webapp/frontend/dist
```

## 🌐 GitHub Pages Deployment

### Automatic Deployment Process

#### Build Configuration
The frontend is automatically built and deployed:

```typescript
// vite.config.ts
export default defineConfig({
  base: '/misp-ddos-automation/',  // Repository name
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
```

#### Deployment Pipeline
1. **Source Code**: React TypeScript application
2. **Build Process**: Vite production build
3. **Asset Optimization**: Minification and compression
4. **GitHub Pages**: Automatic deployment via Actions

### Custom Domain Setup (Optional)

#### DNS Configuration
Add these DNS records:
```dns
# For apex domain (example.com)
A     @     185.199.108.153
A     @     185.199.109.153
A     @     185.199.110.153
A     @     185.199.111.153

# For subdomain (www.example.com)
CNAME www   your-username.github.io
```

#### Repository Configuration
1. Add `CNAME` file to `webapp/frontend/public/`:
```
your-domain.com
```

2. Update GitHub Pages settings:
   - **Custom domain**: `your-domain.com`
   - **Enforce HTTPS**: ✅ Enable

## 🔧 Production Configuration

### Environment Variables

#### Frontend Environment
```bash
# Production (.env.production)
VITE_API_BASE_URL=https://your-username.github.io/misp-ddos-automation
VITE_ENVIRONMENT=production
VITE_DEBUG=false
```

#### CLI Environment
```bash
# Production environment variables (via GitHub Secrets)
MISP_URL=https://your-misp-instance.com
MISP_API_KEY=your_production_api_key
MISP_VERIFY_SSL=true  # Enable for production
MISP_TIMEOUT=30
MISP_MAX_RETRIES=3
LOG_LEVEL=INFO
```

### Security Configuration

#### Content Security Policy
```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.github.com;
```

#### SSL/TLS Configuration
```yaml
# For custom domains, ensure HTTPS is enforced
- name: Configure HTTPS
  run: |
    echo "Enforce HTTPS: true" >> _config.yml
```

## 📊 Monitoring & Maintenance

### Workflow Monitoring

#### GitHub Actions Dashboard
Monitor your workflows at:
`https://github.com/YOUR_USERNAME/misp-ddos-automation/actions`

#### Key Metrics to Monitor
- **Success Rate**: Percentage of successful workflow runs
- **Execution Time**: Average time per workflow run
- **Error Patterns**: Common failure points
- **Data Freshness**: Time since last successful data update

### Performance Monitoring

#### Lighthouse Scores (Targets)
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 90+

#### Core Web Vitals
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

### Error Handling & Alerts

#### Workflow Failure Notifications
Set up notifications for workflow failures:

1. **Repository Settings** → **Notifications**
2. Enable **Actions** notifications
3. Configure **Email** or **Slack** integration

#### Error Recovery
Common recovery procedures:

```bash
# Manual workflow trigger
# Go to Actions tab → Select workflow → Run workflow

# Local testing before push
cd cli
python src/misp_client.py --test-connection
python src/misp_client.py --fetch-dashboard-data --output test-output.json
```

## 🔄 Maintenance & Updates

### Regular Maintenance Tasks

#### Weekly Tasks
- [ ] Review workflow success rates
- [ ] Check for outdated dependencies
- [ ] Monitor performance metrics
- [ ] Verify data freshness

#### Monthly Tasks
- [ ] Update Python dependencies: `pip install -r requirements.txt --upgrade`
- [ ] Update Node.js dependencies: `npm update`
- [ ] Review security advisories
- [ ] Test backup/recovery procedures

#### Quarterly Tasks
- [ ] Audit GitHub secrets rotation
- [ ] Review and update documentation
- [ ] Performance optimization review
- [ ] Security assessment

### Dependency Updates

#### Python Dependencies
```bash
# Update CLI dependencies
cd cli
pip install -r requirements.txt --upgrade
pip freeze > requirements.txt
```

#### Node.js Dependencies
```bash
# Update frontend dependencies
cd webapp/frontend
npm update
npm audit fix
```

### Security Updates

#### API Key Rotation
1. Generate new MISP API key
2. Update GitHub secret `MISP_API_KEY`
3. Test with manual workflow run
4. Revoke old API key

#### Certificate Updates
```bash
# Update SSL certificate validation
# Update MISP_VERIFY_SSL secret if certificate changes
```

## 🚨 Troubleshooting

### Common Deployment Issues

#### Workflow Fails to Start
**Error**: "Workflow not found"
**Solution**: 
- Verify `.github/workflows/refresh-misp-data.yml` exists
- Check YAML syntax with online validator
- Ensure repository has Actions enabled

#### MISP Connection Failures
**Error**: "Connection refused" or "SSL certificate error"
**Solutions**:
- Verify `MISP_URL` secret is correct
- Check `MISP_API_KEY` is valid and has permissions
- Set `MISP_VERIFY_SSL=false` for self-signed certificates
- Ensure MISP instance is accessible from GitHub Actions

#### GitHub Pages Not Updating
**Error**: Site not reflecting latest changes
**Solutions**:
- Check Actions tab for deployment status
- Verify `publish_dir` path in workflow
- Clear browser cache and CDN cache
- Check if custom domain DNS is configured correctly

#### Permission Errors
**Error**: "Permission denied" during git operations
**Solutions**:
- Verify "Read and write permissions" enabled in Actions settings
- Check if repository is private (may need additional permissions)
- Ensure `GITHUB_TOKEN` has required scopes

### Performance Issues

#### Slow Workflow Execution
**Solutions**:
- Review dependency caching configuration
- Optimize Python package installation
- Consider reducing data processing scope
- Implement parallel processing where possible

#### Large Data Files
**Error**: "File size too large" or memory issues
**Solutions**:
- Implement data pagination
- Add file size validation
- Use streaming for large datasets
- Consider data compression

### Security Issues

#### Exposed Secrets
**Action Required**: If secrets are accidentally committed:
1. Immediately revoke compromised API keys
2. Generate new credentials
3. Update GitHub secrets
4. Review commit history and clean if necessary

#### TLP:RED Data Exposure
**Critical**: If TLP:RED data appears in dashboard:
1. Immediately disable GitHub Pages
2. Review and fix filtering logic
3. Audit all generated data files
4. Implement additional validation checks

## 📞 Emergency Procedures

### Immediate Response Actions

#### Service Outage
1. Check GitHub Status page
2. Verify MISP instance availability
3. Review recent workflow changes
4. Implement emergency data fallback

#### Security Incident
1. Disable automatic workflows
2. Revoke all API keys immediately
3. Review access logs
4. Contact security team
5. Document incident details

#### Data Corruption
1. Stop all automated processes
2. Restore from last known good backup
3. Identify corruption source
4. Implement additional validation
5. Resume operations after verification

### Recovery Procedures

#### Rollback Deployment
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or rollback to specific commit
git reset --hard COMMIT_HASH
git push --force-with-lease origin main
```

#### Restore Service
```bash
# Manual workflow trigger after fixes
# GitHub → Actions → refresh-misp-data → Run workflow

# Local validation before deploying
cd cli
python src/misp_client.py --test-connection
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Repository forked/cloned successfully
- [ ] GitHub Pages enabled with correct source
- [ ] All required secrets configured
- [ ] Workflow permissions set correctly
- [ ] MISP connection tested locally
- [ ] SSL configuration verified

### Post-Deployment
- [ ] First workflow run completed successfully
- [ ] Dashboard accessible at GitHub Pages URL
- [ ] Data loading correctly in frontend
- [ ] No TLP:RED data visible in dashboard
- [ ] Charts rendering properly
- [ ] Mobile responsiveness verified
- [ ] Performance metrics within targets

### Production Validation
- [ ] Scheduled workflows executing on time
- [ ] Error handling working correctly
- [ ] Monitoring and alerting configured
- [ ] Backup procedures documented
- [ ] Team access and permissions verified
- [ ] Documentation updated and accessible

---

## 🎉 Success!

Once all checklist items are complete, your MISP DDoS Automation Suite will be:

✅ **Fully Automated**: Data refreshes every 30 minutes  
✅ **Secure**: TLP:RED filtering and secure credential management  
✅ **Professional**: Cybersecurity-themed dashboard  
✅ **Accessible**: Available 24/7 via GitHub Pages  
✅ **Maintainable**: Comprehensive monitoring and error handling  

**Dashboard URL**: `https://YOUR_USERNAME.github.io/misp-ddos-automation/`

---

**🚨 Security Reminder**: This system handles sensitive threat intelligence data. Always follow your organization's security policies and incident response procedures.