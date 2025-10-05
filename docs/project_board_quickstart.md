# GitHub Project Board Setup - Quick Reference

## Prerequisites Checklist
- [ ] GitHub CLI installed (`gh --version`)
- [ ] GitHub CLI authenticated (`gh auth login`)
- [ ] Repository permissions (admin access)
- [ ] Project permissions (ability to create projects)

## Step-by-Step Setup Guide

### 1. Run Automated Setup Script
```powershell
# Navigate to project directory
cd c:\Users\Idreis\Desktop\MISP\misp_automation

# Run the project board setup script
python scripts\create_project_board.py
```

This script will:
- ✅ Create standardized labels
- ✅ Create project milestones  
- ✅ Create initial backlog issues
- ✅ Display manual setup instructions

### 2. Create GitHub Project Board (Manual)

#### Navigate to GitHub Projects
1. Go to: https://github.com/PabloPenguin
2. Click **"Projects"** tab
3. Click **"New Project"** button

#### Configure Project
- **Template**: Choose "Team planning"
- **Name**: `MISP DDoS Automation`
- **Description**: `Project management for MISP DDoS automation development`
- **Visibility**: Private (recommended) or Public

### 3. Configure Project Board Structure

#### Add Custom Fields
In the project settings, add these custom fields:

| Field Name | Type | Options |
|------------|------|---------|
| Story Points | Number | 1, 2, 3, 5, 8, 13, 21 |
| Epic | Text | Free text |
| Security Impact | Single Select | None, Low, Medium, High, Critical |
| Sprint | Text | Sprint identifier |

#### Configure Board Columns
Set up these columns in order:

1. **📥 Backlog** - New issues awaiting triage
2. **📋 Sprint Planning** - Issues being planned for sprints
3. **🚧 In Progress** - Currently being worked on
4. **👀 Code Review** - Pull requests under review
5. **🔒 Security Review** - Security-sensitive items
6. **🧪 Testing** - Items in testing phase
7. **✅ Done** - Completed items

#### Create Project Views

**Kanban Board View** (Default)
- Shows all items in workflow columns
- Group by: Status
- Sort by: Priority, then Created Date

**Priority View**
- Filter by: Priority labels (critical, high, medium, low)
- Sort by: Priority descending
- Useful for focusing on urgent items

**Component View**
- Filter by: Component labels (cli, webapp, security, docs, testing, infrastructure)
- Group by: Component
- Useful for team specialization

**Security View**
- Filter by: Security labels and high security impact
- Sort by: Security Impact, Priority
- Critical for security-focused work

### 4. Link Repository to Project

#### In Project Settings:
1. Go to project **Settings**
2. Under **Manage access**, add repository
3. Select `PabloPenguin/misp-ddos-automation`
4. Enable **Workflows** (for automation)

#### Verify Connection:
- Repository should appear in project settings
- Issues from repo should be available to add

### 5. Add Existing Issues to Project

#### Bulk Add Method:
1. In project board, click **"+ Add items"**
2. Select **"Add items from repository"**
3. Choose `misp-ddos-automation` repository
4. Select issues created by the setup script
5. Click **"Add selected items"**

#### Individual Assignment:
For each issue added:
1. Set **Status** column (Backlog for new issues)
2. Assign **Story Points** (estimate effort)
3. Set **Epic** field (group related issues)
4. Set **Security Impact** if applicable
5. Assign to team member if ready

### 6. Configure Automation

#### Verify Workflow File:
The automation should already be configured in:
```
.github/workflows/project-automation.yml
```

Key settings:
- Project URL: `https://github.com/users/PabloPenguin/projects/5`
- Project Number: `5`

#### Test Automation:
1. Create a test issue in the repository
2. Check if it automatically appears in project board
3. Add labels and verify automated movement
4. Close issue and verify status update

### 7. Initial Sprint Setup

#### Create First Sprint:
1. Select 5-8 high-priority issues from Backlog
2. Move to **Sprint Planning** column
3. Set **Sprint** field to "Sprint 1 - Oct 2025"
4. Assign to team members
5. Set story point estimates

#### Sprint Planning Meeting:
- Review selected issues
- Confirm story point estimates
- Identify dependencies and blockers
- Move ready issues to **In Progress**

## Project Board URLs

After creation, update these URLs:

- **Project Board**: https://github.com/users/PabloPenguin/projects/5
- **Repository Issues**: https://github.com/PabloPenguin/misp-ddos-automation/issues
- **Workflow Automation**: https://github.com/PabloPenguin/misp-ddos-automation/actions

## Troubleshooting

### Common Issues:

**Issue: GitHub CLI not authenticated**
```powershell
gh auth login
# Follow prompts to authenticate
```

**Issue: Permission denied creating labels**
- Ensure you have admin permissions on the repository
- Check GitHub token scopes include repo permissions

**Issue: Project automation not working**
- Verify project URL in workflow file
- Check GitHub Actions are enabled for repository
- Confirm project has repository linked

**Issue: Issues not appearing in project**
- Check repository is linked to project
- Verify automation workflow is active
- Manually add issues if automation fails

### Getting Help:

- **GitHub CLI Issues**: `gh --help`
- **Project Board Help**: GitHub Projects documentation
- **Automation Issues**: Check GitHub Actions logs

## Success Criteria

Project board setup is complete when:
- [ ] Project board created with correct structure
- [ ] All labels and milestones created
- [ ] Initial issues added to project
- [ ] Automation workflows active
- [ ] Team has access and understands workflow
- [ ] First sprint planned and started

## Next Steps After Setup

1. **Team Onboarding**: Train team on project board usage
2. **Workflow Refinement**: Adjust board structure based on team feedback
3. **Sprint Cadence**: Establish regular sprint planning meetings
4. **Metrics Tracking**: Set up project insights and reporting
5. **Integration**: Connect with other tools (Slack, email notifications)

This project board will provide comprehensive project management for the MISP DDoS Automation development lifecycle!