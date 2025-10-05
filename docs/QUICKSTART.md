# MISP DDoS Automation - Quick Start Guide

## Prerequisites
- Python 3.9 or higher
- Git (optional, recommended)
- MISP instance with API access
- Network connectivity to MISP server

## Installation

### 1. Clone or Download
```bash
git clone https://github.com/PabloPenguin/misp-ddos-automation.git
cd misp-ddos-automation
```

### 2. Run Automated Setup
```bash
python scripts/setup.py
```

This will:
- ✅ Check Python version
- ✅ Create virtual environment
- ✅ Install dependencies
- ✅ Setup configuration files
- ✅ Validate installation

### 3. Configure MISP Connection
Edit the `.env` file with your MISP details:
```env
MISP_URL=https://your-misp-instance.com
MISP_API_KEY=your_api_key_here
```

### 4. Test Connection
```bash
# Activate virtual environment
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate     # Windows

# Test MISP connection
python cli/src/cli.py test-connection
```

## Quick Usage Examples

### Interactive Mode (Recommended for First Use)
```bash
python cli/src/cli.py interactive
```

### Upload CSV File
```bash
python cli/src/cli.py upload-csv --file cli/templates/ddos_events_template.csv
```

### Upload JSON File
```bash
python cli/src/cli.py upload-json --file cli/templates/ddos_events_template.json
```

### Search Events
```bash
python cli/src/cli.py search --tag "information-security-indicators:incident-type=\"ddos\""
```

## File Formats

### CSV Format
```csv
title,description,attacker_ips,victim_ips,attack_ports,attack_type,severity
"DDoS Attack","Description here","1.2.3.4,5.6.7.8","9.10.11.12","80,443","direct-flood","high"
```

### JSON Format
```json
{
  "events": [
    {
      "title": "DDoS Attack",
      "description": "Description here",
      "attacker_ips": ["1.2.3.4", "5.6.7.8"],
      "victim_ips": ["9.10.11.12"],
      "attack_ports": [80, 443],
      "attack_type": "direct-flood",
      "severity": "high"
    }
  ]
}
```

## Need Help?
- 📖 Full documentation: [README.md](README.md)
- 🐛 Report issues: [GitHub Issues](https://github.com/PabloPenguin/misp-ddos-automation/issues)
- 💬 Ask questions: [GitHub Discussions](https://github.com/PabloPenguin/misp-ddos-automation/discussions)

## Security Notes
- ⚠️ Never commit `.env` file to version control
- 🔐 Use HTTPS connections only in production
- 🔄 Regularly rotate API keys