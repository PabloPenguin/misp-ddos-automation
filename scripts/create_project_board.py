#!/usr/bin/env python3
"""
GitHub Project Board Creator for MISP DDoS Automation

This script helps create and configure the GitHub project board with all necessary
components, labels, and initial issues.
"""

import os
import json
import subprocess
import sys
from typing import List, Dict, Any
import time

class GitHubProjectSetup:
    """GitHub Project Board setup automation."""
    
    def __init__(self):
        self.repo_owner = "PabloPenguin"
        self.repo_name = "misp-ddos-automation"
        self.project_number = 5  # From your workflow file
        self.gh_executable = 'gh'  # Will be updated by check_gh_cli
        
    def check_gh_cli(self) -> bool:
        """Check if GitHub CLI is installed and authenticated."""
        # Try common GitHub CLI paths on Windows
        gh_paths = [
            'gh',  # In PATH
            'gh.exe',  # In PATH with extension
            r'C:\Program Files\GitHub CLI\gh.exe',  # Default install location
            r'C:\Program Files (x86)\GitHub CLI\gh.exe',  # 32-bit install
            r'C:\Users\{}\AppData\Local\GitHubCLI\gh.exe'.format(os.environ.get('USERNAME', '')),  # User install
            r'C:\ProgramData\chocolatey\lib\gh\tools\bin\gh.exe',  # Chocolatey install
        ]
        
        gh_executable = None
        for gh_path in gh_paths:
            try:
                result = subprocess.run([gh_path, '--version'], 
                                      capture_output=True, text=True, timeout=10)
                if result.returncode == 0:
                    gh_executable = gh_path
                    print(f"✅ Found GitHub CLI at: {gh_path}")
                    print(f"Version: {result.stdout.strip().split()[2] if len(result.stdout.split()) > 2 else 'Unknown'}")
                    break
            except (FileNotFoundError, subprocess.TimeoutExpired, IndexError):
                continue
        
        if not gh_executable:
            print("❌ GitHub CLI not found in common locations")
            print("\n📥 Installation Options:")
            print("1. Winget: winget install --id GitHub.cli")
            print("2. Chocolatey: choco install gh")
            print("3. Scoop: scoop install gh")
            print("4. Download: https://cli.github.com/")
            print("5. Manual setup: Use the manual setup guide instead")
            
            choice = input("\nWould you like to continue with manual setup? (y/N): ").strip().lower()
            if choice == 'y':
                print("✅ Proceeding with manual setup instructions")
                return "manual"
            return False
        
        # Check authentication
        try:
            result = subprocess.run([gh_executable, 'auth', 'status'], 
                                  capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                print("✅ GitHub CLI is authenticated")
                # Store the working executable for later use
                self.gh_executable = gh_executable
                return True
            else:
                print("❌ GitHub CLI not authenticated")
                print(f"Please run: {gh_executable} auth login")
                return False
        except (subprocess.TimeoutExpired, FileNotFoundError):
            print("❌ GitHub CLI authentication check failed")
            print(f"Please run: {gh_executable} auth login")
            return False
    
    def create_labels(self) -> bool:
        """Create standardized labels for the repository."""
        labels = [
            # Priority Labels
            {"name": "priority:critical", "color": "d73a4a", "description": "Immediate attention required"},
            {"name": "priority:high", "color": "ff6b6b", "description": "Important, next in queue"},
            {"name": "priority:medium", "color": "ffa726", "description": "Standard priority"},
            {"name": "priority:low", "color": "4fc3f7", "description": "Nice to have"},
            
            # Component Labels
            {"name": "component:cli", "color": "0052cc", "description": "CLI tool development"},
            {"name": "component:webapp", "color": "1976d2", "description": "Web application"},
            {"name": "component:security", "color": "d32f2f", "description": "Security features"},
            {"name": "component:docs", "color": "388e3c", "description": "Documentation"},
            {"name": "component:testing", "color": "7b1fa2", "description": "Test suite"},
            {"name": "component:infrastructure", "color": "616161", "description": "DevOps/deployment"},
            
            # Type Labels
            {"name": "type:bug", "color": "d73a4a", "description": "Something isn't working"},
            {"name": "type:feature", "color": "4caf50", "description": "New feature or request"},
            {"name": "type:enhancement", "color": "2196f3", "description": "Improvement to existing feature"},
            {"name": "type:security", "color": "f44336", "description": "Security-related issue"},
            {"name": "type:documentation", "color": "009688", "description": "Documentation improvements"},
            {"name": "type:maintenance", "color": "795548", "description": "Code maintenance and refactoring"},
            
            # Status Labels
            {"name": "status:triage", "color": "fbca04", "description": "Needs initial review"},
            {"name": "status:blocked", "color": "e91e63", "description": "Cannot proceed due to dependency"},
            {"name": "status:in-progress", "color": "ff9800", "description": "Currently being worked on"},
            {"name": "status:review", "color": "9c27b0", "description": "Under review"},
            {"name": "status:testing", "color": "673ab7", "description": "In testing phase"},
            
            # Epic Labels
            {"name": "epic:cli-development", "color": "0d47a1", "description": "CLI tool development"},
            {"name": "epic:webapp-development", "color": "1565c0", "description": "Web application development"},
            {"name": "epic:security-compliance", "color": "c62828", "description": "Security and compliance"},
            {"name": "epic:documentation", "color": "2e7d32", "description": "Documentation and training"},
            {"name": "epic:testing-qa", "color": "6a1b9a", "description": "Testing and quality assurance"},
            {"name": "epic:devops-infrastructure", "color": "424242", "description": "DevOps and infrastructure"},
        ]
        
        print("Creating repository labels...")
        success_count = 0
        
        for label in labels:
            try:
                cmd = [
                    self.gh_executable, 'label', 'create', label['name'],
                    '--color', label['color'],
                    '--description', label['description'],
                    '--repo', f"{self.repo_owner}/{self.repo_name}"
                ]
                
                result = subprocess.run(cmd, capture_output=True, text=True)
                
                if result.returncode == 0:
                    print(f"✅ Created label: {label['name']}")
                    success_count += 1
                elif "already exists" in result.stderr:
                    print(f"ℹ️  Label exists: {label['name']}")
                    success_count += 1
                else:
                    print(f"❌ Failed to create label {label['name']}: {result.stderr}")
                    
            except Exception as e:
                print(f"❌ Error creating label {label['name']}: {e}")
        
        print(f"✅ Labels setup complete: {success_count}/{len(labels)} processed")
        return success_count > 0
    
    def create_milestones(self) -> bool:
        """Create project milestones using GitHub API."""
        milestones = [
            {
                "title": "v1.0.0 - Core CLI Release",
                "description": "Full-featured CLI tool with security controls",
                "due_date": "2025-11-01"
            },
            {
                "title": "v1.1.0 - Enhanced CLI Features", 
                "description": "Advanced CLI features and improvements",
                "due_date": "2025-12-01"
            },
            {
                "title": "v2.0.0 - Web Application Release",
                "description": "Full web application with GitHub Pages hosting",
                "due_date": "2026-02-01"
            },
            {
                "title": "v2.1.0 - Enterprise Features",
                "description": "Enterprise-grade features and compliance",
                "due_date": "2026-04-01"
            }
        ]
        
        print("Creating project milestones...")
        success_count = 0
        
        for milestone in milestones:
            try:
                # Use GitHub API through gh cli since milestone command not available
                api_data = {
                    "title": milestone["title"],
                    "description": milestone["description"],
                    "due_on": milestone["due_date"] + "T23:59:59Z"
                }
                
                cmd = [
                    self.gh_executable, 'api', 
                    f'repos/{self.repo_owner}/{self.repo_name}/milestones',
                    '--method', 'POST',
                    '--field', f'title={milestone["title"]}',
                    '--field', f'description={milestone["description"]}',
                    '--field', f'due_on={milestone["due_date"]}T23:59:59Z'
                ]
                
                result = subprocess.run(cmd, capture_output=True, text=True)
                
                if result.returncode == 0:
                    print(f"✅ Created milestone: {milestone['title']}")
                    success_count += 1
                elif "already exists" in result.stderr.lower() or "validation failed" in result.stderr.lower():
                    print(f"ℹ️  Milestone may already exist: {milestone['title']}")
                    success_count += 1
                else:
                    print(f"⚠️  Milestone creation issue for {milestone['title']}: {result.stderr}")
                    # Don't fail the whole process for milestone issues
                    
            except Exception as e:
                print(f"⚠️  Error creating milestone {milestone['title']}: {e}")
        
        if success_count == 0:
            print("ℹ️  Milestones will need to be created manually via GitHub web interface")
        
        print(f"✅ Milestones setup complete: {success_count}/{len(milestones)} processed")
        return True  # Don't fail the whole process for milestones
    
    def create_initial_issues(self) -> bool:
        """Create initial backlog issues."""
        issues = [
            # CLI Development Issues
            {
                "title": "[CLI-001] Implement secure MISP API client with connection validation",
                "body": """## Description
Implement a secure MISP API client that handles authentication, SSL validation, and connection testing.

## Acceptance Criteria
- [ ] Secure credential management via environment variables
- [ ] SSL/TLS certificate validation
- [ ] Connection timeout and retry logic
- [ ] API key validation
- [ ] Error handling and logging

## Security Requirements
- Input validation for all API parameters
- Secure storage of credentials
- Protection against injection attacks
- Audit logging for all API calls

## Definition of Done
- [ ] Code reviewed and approved
- [ ] Unit tests with >90% coverage
- [ ] Security testing completed
- [ ] Documentation updated
""",
                "labels": ["component:cli", "type:feature", "priority:high", "epic:cli-development"],
                "milestone": "v1.0.0 - Core CLI Release"
            },
            {
                "title": "[CLI-002] Add CSV file parsing with security validation",
                "body": """## Description
Implement secure CSV file parsing with comprehensive validation and sanitization.

## Acceptance Criteria
- [ ] File size and type validation
- [ ] CSV structure validation
- [ ] Data sanitization and validation
- [ ] Memory-safe processing for large files
- [ ] Error handling and reporting

## Security Requirements
- Path traversal protection
- File size limits (100MB)
- Input sanitization
- Malware scanning integration
- CSV injection prevention

## Definition of Done
- [ ] Code reviewed and approved
- [ ] Security testing completed
- [ ] Performance testing with large files
- [ ] Documentation with examples
""",
                "labels": ["component:cli", "type:feature", "priority:high", "epic:cli-development"],
                "milestone": "v1.0.0 - Core CLI Release"
            },
            {
                "title": "[SEC-001] Conduct comprehensive security assessment",
                "body": """## Description
Perform a comprehensive security assessment of the entire MISP DDoS automation system.

## Scope
- [ ] Code review for security vulnerabilities
- [ ] Dependency vulnerability scanning
- [ ] Input validation testing
- [ ] Authentication and authorization testing
- [ ] Network security assessment

## Deliverables
- [ ] Security assessment report
- [ ] Vulnerability remediation plan
- [ ] Security testing framework
- [ ] Compliance documentation

## Priority
This is a critical security task that should be completed before any production deployment.
""",
                "labels": ["component:security", "type:security", "priority:critical", "epic:security-compliance"],
                "milestone": "v1.0.0 - Core CLI Release"
            },
            {
                "title": "[WEB-001] Design and implement React frontend architecture",
                "body": """## Description
Design and implement the React frontend architecture for the web application.

## Technical Requirements
- [ ] React 18 with TypeScript
- [ ] Material-UI (MUI) v5 for components
- [ ] React Query for data fetching
- [ ] React Hook Form for form handling
- [ ] Responsive design for mobile/desktop

## Features
- [ ] File upload with drag & drop
- [ ] Real-time progress tracking
- [ ] Event visualization
- [ ] User authentication
- [ ] Error handling and notifications

## Definition of Done
- [ ] Architecture documented
- [ ] Core components implemented
- [ ] Unit tests written
- [ ] Accessibility compliance
""",
                "labels": ["component:webapp", "type:feature", "priority:medium", "epic:webapp-development"],
                "milestone": "v2.0.0 - Web Application Release"
            },
            {
                "title": "[DOC-001] Create comprehensive user documentation",
                "body": """## Description
Create comprehensive user documentation covering all aspects of the MISP DDoS automation system.

## Documentation Sections
- [ ] Installation and setup guide
- [ ] CLI usage examples
- [ ] Web application user guide
- [ ] Security best practices
- [ ] Troubleshooting guide
- [ ] API reference

## Requirements
- [ ] Clear, step-by-step instructions
- [ ] Screenshots and examples
- [ ] Security warnings and best practices
- [ ] Multi-format support (markdown, PDF)

## Target Audience
- Security analysts
- IT administrators
- MISP administrators
- Developers and integrators
""",
                "labels": ["component:docs", "type:documentation", "priority:high", "epic:documentation"],
                "milestone": "v1.0.0 - Core CLI Release"
            }
        ]
        
        print("Creating initial backlog issues...")
        success_count = 0
        
        for issue in issues:
            try:
                # Build the command
                cmd = [
                    self.gh_executable, 'issue', 'create',
                    '--title', issue['title'],
                    '--body', issue['body'],
                    '--repo', f"{self.repo_owner}/{self.repo_name}"
                ]
                
                # Add labels
                for label in issue['labels']:
                    cmd.extend(['--label', label])
                
                # Add milestone
                if 'milestone' in issue:
                    cmd.extend(['--milestone', issue['milestone']])
                
                result = subprocess.run(cmd, capture_output=True, text=True)
                
                if result.returncode == 0:
                    print(f"✅ Created issue: {issue['title']}")
                    success_count += 1
                else:
                    print(f"❌ Failed to create issue {issue['title']}: {result.stderr}")
                    
                # Rate limiting - GitHub has API limits
                time.sleep(1)
                    
            except Exception as e:
                print(f"❌ Error creating issue {issue['title']}: {e}")
        
        print(f"✅ Issues creation complete: {success_count}/{len(issues)} created")
        return success_count > 0
    
    def display_manual_setup_instructions(self):
        """Display manual setup instructions for the project board."""
        print("\n" + "="*60)
        print("🎯 GITHUB PROJECT BOARD MANUAL SETUP")
        print("="*60)
        print()
        print("Now you need to manually create and configure the project board:")
        print()
        print("1. 🌐 Create Project Board:")
        print("   • Go to: https://github.com/PabloPenguin")
        print("   • Click 'Projects' tab")
        print("   • Click 'New Project'")
        print("   • Choose 'Team planning' template")
        print("   • Name: 'MISP DDoS Automation'")
        print("   • Description: 'Project management for MISP DDoS automation development'")
        print()
        print("2. ⚙️  Configure Project Views:")
        print("   • Kanban Board View (default)")
        print("   • Priority View (filter by priority labels)")
        print("   • Component View (filter by component labels)")
        print("   • Security View (filter by security labels)")
        print()
        print("3. 🏷️  Add Custom Fields:")
        print("   • Story Points (Number field: 1, 2, 3, 5, 8, 13, 21)")
        print("   • Epic (Text field)")
        print("   • Security Impact (Single select: None, Low, Medium, High, Critical)")
        print("   • Sprint (Text field)")
        print()
        print("4. 📋 Configure Board Columns:")
        print("   • 📥 Backlog")
        print("   • 📋 Sprint Planning")
        print("   • 🚧 In Progress")
        print("   • 👀 Code Review")
        print("   • 🔒 Security Review")
        print("   • 🧪 Testing")
        print("   • ✅ Done")
        print()
        print("5. 🔗 Link Repository:")
        print("   • In project settings, link to PabloPenguin/misp-ddos-automation")
        print("   • Enable automation workflows")
        print()
        print("6. 🎯 Add Existing Issues:")
        print("   • Go to the Issues tab in your repository")
        print("   • Select the issues created by this script")
        print("   • Add them to the project board")
        print("   • Assign appropriate custom field values")
        print()
        print("7. ✅ Verify Automation:")
        print("   • Create a test issue")
        print("   • Check if it appears in the project board automatically")
        print("   • Test label-based automation")
        print()
        print("📌 Important Notes:")
        print("   • Project number in workflow is already set to 5")
        print("   • Make sure the project URL matches: https://github.com/users/PabloPenguin/projects/5")
        print("   • Enable GitHub Actions if not already enabled")
        print()
        print("🔗 Quick Links:")
        print(f"   • Repository: https://github.com/{self.repo_owner}/{self.repo_name}")
        print(f"   • Projects: https://github.com/{self.repo_owner}?tab=projects")
        print(f"   • Issues: https://github.com/{self.repo_owner}/{self.repo_name}/issues")
        print()
    
    def run_setup(self):
        """Run the complete project board setup."""
        print("🛡️  MISP DDoS Automation - GitHub Project Board Setup")
        print("="*60)
        print()
        
        # Check prerequisites
        gh_status = self.check_gh_cli()
        if gh_status == False:
            return False
        elif gh_status == "manual":
            # Skip automated setup, just show manual instructions
            self.display_manual_setup_instructions()
            return True
        
        print("\n🚀 Starting project board setup...")
        
        # Create labels
        if not self.create_labels():
            print("❌ Label creation failed")
            return False
        
        # Create milestones
        self.create_milestones()
        
        # Create initial issues
        self.create_initial_issues()
        
        # Display manual setup instructions
        self.display_manual_setup_instructions()
        
        print("✅ Automated setup complete!")
        print("Please follow the manual setup instructions above to complete the project board configuration.")
        
        return True


def main():
    """Main setup entry point."""
    try:
        setup = GitHubProjectSetup()
        success = setup.run_setup()
        sys.exit(0 if success else 1)
        
    except KeyboardInterrupt:
        print("\n\n❌ Setup cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()