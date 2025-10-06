#!/usr/bin/env python3
"""
MISP DDoS Automation Setup Script

Automated setup and configuration for the MISP DDoS automation project.
Handles dependency installation, environment configuration, and validation.
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path
from typing import List, Tuple, Optional
import tempfile
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class SetupError(Exception):
    """Setup-specific error handling."""
    pass


class MISPSetup:
    """MISP DDoS Automation setup manager."""
    
    def __init__(self, project_root: Optional[Path] = None):
        """Initialize setup manager."""
        self.project_root = project_root or Path(__file__).parent
        self.cli_dir = self.project_root / "cli"
        self.requirements_file = self.cli_dir / "requirements.txt"
        self.env_template = self.project_root / ".env.template"
        self.env_file = self.project_root / ".env"
        
        logger.info(f"Project root: {self.project_root}")
    
    def check_python_version(self) -> bool:
        """Check if Python version meets requirements."""
        version = sys.version_info
        required = (3, 9)
        
        if version >= required:
            logger.info(f"✓ Python {version.major}.{version.minor}.{version.micro} detected")
            return True
        else:
            logger.error(f"✗ Python {required[0]}.{required[1]}+ required, found {version.major}.{version.minor}")
            return False
    
    def check_git_repository(self) -> bool:
        """Check if we're in a git repository."""
        git_dir = self.project_root / ".git"
        if git_dir.exists():
            logger.info("✓ Git repository detected")
            return True
        else:
            logger.warning("⚠ Not in a git repository - some features may be limited")
            return False
    
    def create_virtual_environment(self) -> bool:
        """Create Python virtual environment."""
        venv_dir = self.project_root / "venv"
        
        if venv_dir.exists():
            logger.info("✓ Virtual environment already exists")
            return True
        
        try:
            logger.info("Creating virtual environment...")
            subprocess.run([
                sys.executable, "-m", "venv", str(venv_dir)
            ], check=True, capture_output=True)
            
            logger.info("✓ Virtual environment created")
            return True
            
        except subprocess.CalledProcessError as e:
            logger.error(f"✗ Failed to create virtual environment: {e}")
            return False
    
    def get_venv_python(self) -> Path:
        """Get path to Python in virtual environment."""
        venv_dir = self.project_root / "venv"
        
        if sys.platform == "win32":
            return venv_dir / "Scripts" / "python.exe"
        else:
            return venv_dir / "bin" / "python"
    
    def install_dependencies(self) -> bool:
        """Install Python dependencies."""
        if not self.requirements_file.exists():
            logger.error(f"✗ Requirements file not found: {self.requirements_file}")
            return False
        
        python_exe = self.get_venv_python()
        
        try:
            logger.info("Installing dependencies...")
            subprocess.run([
                str(python_exe), "-m", "pip", "install", "-r", str(self.requirements_file)
            ], check=True, capture_output=True)
            
            logger.info("✓ Dependencies installed successfully")
            return True
            
        except subprocess.CalledProcessError as e:
            logger.error(f"✗ Failed to install dependencies: {e}")
            return False
    
    def setup_environment_file(self) -> bool:
        """Setup environment configuration file."""
        if self.env_file.exists():
            logger.info("✓ Environment file already exists")
            response = input("Overwrite existing .env file? (y/N): ").strip().lower()
            if response != 'y':
                return True
        
        if not self.env_template.exists():
            logger.error(f"✗ Environment template not found: {self.env_template}")
            return False
        
        try:
            # Copy template to .env
            shutil.copy2(self.env_template, self.env_file)
            
            logger.info("✓ Environment file created from template")
            logger.warning("⚠ Please edit .env file with your MISP configuration")
            
            return True
            
        except Exception as e:
            logger.error(f"✗ Failed to create environment file: {e}")
            return False
    
    def validate_project_structure(self) -> bool:
        """Validate project directory structure."""
        required_dirs = [
            "cli/src",
            "cli/templates",
            "tests/test_cli",
            "webapp/backend",
            "webapp/frontend/src",
            "docs",
            "scripts",
            "shared"
        ]
        
        missing_dirs = []
        for dir_path in required_dirs:
            full_path = self.project_root / dir_path
            if not full_path.exists():
                missing_dirs.append(dir_path)
        
        if missing_dirs:
            logger.error(f"✗ Missing directories: {', '.join(missing_dirs)}")
            return False
        
        logger.info("✓ Project structure validated")
        return True
    
    def test_cli_installation(self) -> bool:
        """Test CLI installation by running help command."""
        python_exe = self.get_venv_python()
        cli_script = self.cli_dir / "src" / "cli.py"
        
        if not cli_script.exists():
            logger.error(f"✗ CLI script not found: {cli_script}")
            return False
        
        try:
            # Test import and basic functionality
            result = subprocess.run([
                str(python_exe), str(cli_script), "--help"
            ], capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                logger.info("✓ CLI installation validated")
                return True
            else:
                logger.error(f"✗ CLI test failed: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            logger.error("✗ CLI test timed out")
            return False
        except Exception as e:
            logger.error(f"✗ CLI test error: {e}")
            return False
    
    def setup_git_hooks(self) -> bool:
        """Setup git hooks for development."""
        if not self.check_git_repository():
            return True  # Skip if not in git repo
        
        hooks_dir = self.project_root / ".git" / "hooks"
        if not hooks_dir.exists():
            logger.warning("⚠ Git hooks directory not found")
            return True
        
        # Create pre-commit hook for security checks
        pre_commit_hook = hooks_dir / "pre-commit"
        
        hook_content = """#!/bin/bash
# Pre-commit hook for MISP DDoS Automation

echo "Running pre-commit security checks..."

# Check for secrets in staged files
if git diff --cached --name-only | grep -E "\\.(py|js|ts|json|yml|yaml)$" | xargs grep -l "api[_-]key\\|password\\|secret" > /dev/null; then
    echo "❌ Potential secrets detected in staged files!"
    echo "Please review and remove any hardcoded secrets."
    exit 1
fi

# Check for .env file
if git diff --cached --name-only | grep -q "^\\.env$"; then
    echo "❌ .env file should not be committed!"
    echo "Use .env.template instead."
    exit 1
fi

echo "✅ Pre-commit checks passed"
exit 0
"""
        
        try:
            with open(pre_commit_hook, 'w') as f:
                f.write(hook_content)
            
            # Make executable
            pre_commit_hook.chmod(0o755)
            
            logger.info("✓ Git pre-commit hook installed")
            return True
            
        except Exception as e:
            logger.error(f"✗ Failed to setup git hooks: {e}")
            return False
    
    def display_next_steps(self):
        """Display next steps for the user."""
        print("\n" + "="*60)
        print("🎉 MISP DDoS Automation Setup Complete!")
        print("="*60)
        print()
        print("Next steps:")
        print()
        print("1. Configure MISP connection:")
        print(f"   Edit {self.env_file} with your MISP details")
        print()
        print("2. Test the connection:")
        if sys.platform == "win32":
            print("   venv\\Scripts\\activate")
        else:
            print("   source venv/bin/activate")
        print("   python cli/src/cli.py test-connection")
        print()
        print("3. Try interactive mode:")
        print("   python cli/src/cli.py interactive")
        print()
        print("4. Upload sample data:")
        print("   python cli/src/cli.py upload-csv --file cli/templates/ddos_events_template.csv --dry-run")
        print()
        print("5. View documentation:")
        print("   See README.md for detailed usage instructions")
        print()
        print("⚠ Security reminders:")
        print("   - Never commit .env file to version control")
        print("   - Regularly rotate MISP API keys")
        print("   - Use HTTPS connections only in production")
        print()
        print("🆘 Need help?")
        print("   - GitHub Issues: https://github.com/PabloPenguin/misp-ddos-automation/issues")
        print("   - Documentation: https://github.com/PabloPenguin/misp-ddos-automation/wiki")
        print()
    
    def run_setup(self) -> bool:
        """Run complete setup process."""
        print("🛡️ MISP DDoS Automation Setup")
        print("="*40)
        print()
        
        steps = [
            ("Checking Python version", self.check_python_version),
            ("Validating project structure", self.validate_project_structure),
            ("Checking git repository", self.check_git_repository),
            ("Creating virtual environment", self.create_virtual_environment),
            ("Installing dependencies", self.install_dependencies),
            ("Setting up environment file", self.setup_environment_file),
            ("Setting up git hooks", self.setup_git_hooks),
            ("Testing CLI installation", self.test_cli_installation),
        ]
        
        success_count = 0
        for step_name, step_func in steps:
            print(f"\n{step_name}...")
            try:
                if step_func():
                    success_count += 1
                else:
                    logger.error(f"Step failed: {step_name}")
            except Exception as e:
                logger.error(f"Step error ({step_name}): {e}")
        
        print(f"\n✅ Setup completed: {success_count}/{len(steps)} steps successful")
        
        if success_count == len(steps):
            self.display_next_steps()
            return True
        else:
            print("\n❌ Setup incomplete. Please resolve errors and run setup again.")
            return False


def main():
    """Main setup entry point."""
    try:
        setup = MISPSetup()
        success = setup.run_setup()
        sys.exit(0 if success else 1)
        
    except KeyboardInterrupt:
        print("\n\n❌ Setup cancelled by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Setup failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()