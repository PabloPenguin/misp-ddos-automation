# MISP DDoS Automation Project

[![Security](https://img.shields.io/badge/security-hardened-green.svg)](https://github.com/PabloPenguin/misp-ddos-automation)
[![Python](https://img.shields.io/badge/python-3.9%2B-blue.svg)](https://python.org)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> 🛡️ **Enterprise-grade MISP DDoS event automation with defense-in-depth security**

# 🛡️ MISP DDoS Automation Suite

A comprehensive, secure toolkit for automating DDoS event management in MISP (Malware Information Sharing Platform). Features enterprise-grade CLI tools and a responsive web dashboard with automated GitHub Actions integration.

![MISP Version](https://img.shields.io/badge/MISP-2.5.21+-blue)
![Python](https://img.shields.io/badge/Python-3.11+-green)
![React](https://img.shields.io/badge/React-18+-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)
![Security](https://img.shields.io/badge/Security-TLP%20Compliant-red)

## 🌟 Features

### 🔒 Security-First Design
- **TLP:RED Filtering**: Automatically filters sensitive events from public dashboards
- **Defense-in-Depth**: Multiple security layers following MISP best practices  
- **Secure-by-Design**: Input validation, SSL handling, and secure credential management

### ⚡ CLI Tools
- **Bulk Upload**: CSV and JSON batch processing
- **Interactive Mode**: Guided event creation with validation
- **Template System**: Standardized DDoS event templates
- **Connection Testing**: Validate MISP instance connectivity

### 🎨 Web Dashboard
- **Cybersecurity Theme**: Professional black/yellow interface
- **Interactive Charts**: Real-time threat visualization
- **Responsive Design**: Mobile-friendly dashboard
- **Live Data**: Automated refresh via GitHub Actions

### 🤖 Automation
- **GitHub Actions**: Automated data refresh every 30 minutes
- **GitHub Pages**: Automatic deployment and hosting
- **Error Handling**: Robust retry logic and monitoring

## �️ Architecture

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│                     │    │                     │    │                     │
│   MISP Instance     │◄───┤   CLI Tools         │    │   Web Dashboard     │
│   (Tailscale)       │    │   - Bulk Upload     │    │   - React/TypeScript│
│   - DDoS Events     │    │   - Interactive     │    │   - Chart.js        │
│   - TLP Filtering   │    │   - Templates       │    │   - Material-UI     │
│                     │    │                     │    │                     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
           ▲                          │                          ▲
           │                          │                          │
           │                ┌─────────▼──────────┐               │
           │                │                    │               │
           └────────────────┤  GitHub Actions    ├───────────────┘
                            │  - Automated Sync  │
                            │  - Data Refresh    │
                            │  - Pages Deploy    │
                            │                    │
                            └────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- MISP instance with API access
- GitHub repository with Pages enabled

### 1. Environment Setup
```bash
# Clone repository
git clone https://github.com/PabloPenguin/misp-ddos-automation.git
cd misp-ddos-automation

# Install CLI dependencies
cd cli
pip install -r requirements.txt

# Install frontend dependencies  
cd ../webapp/frontend
npm install
```

### 2. Configuration
```bash
# Copy environment template
cp .env.template .env

# Edit .env with your MISP credentials
MISP_URL=https://your-misp-instance.com
MISP_API_KEY=your-api-key-here
MISP_VERIFY_SSL=false  # for self-signed certificates
```

## 🛠️ Usage

### CLI Tools

The CLI requires environment variables to connect to your MISP instance. You can set them in several ways:

#### Option 1: Using .env file (Recommended)
```bash
# Copy and edit the template
cp .env.template .env
# Edit .env with your MISP credentials, then:
cd cli
python src/misp_client.py --help
```

#### Option 2: Set environment variables directly

**Windows PowerShell:**
```powershell
$env:MISP_URL="https://your-misp-instance.com"
$env:MISP_API_KEY="your-api-key-here"
$env:MISP_VERIFY_SSL="false"  # for self-signed certificates
cd cli
python src/misp_client.py --test-connection
```

**Linux/Mac:**
```bash
export MISP_URL="https://your-misp-instance.com"
export MISP_API_KEY="your-api-key-here"
export MISP_VERIFY_SSL="false"  # for self-signed certificates
cd cli
python src/misp_client.py --test-connection
```

#### Available Commands

**Test Connection:**
```bash
python src/misp_client.py --test-connection
```

**Fetch Dashboard Data:**
```bash
python src/misp_client.py --fetch-dashboard-data --output dashboard-data.json
```

**Process CSV/JSON Files:**
```bash
python src/misp_client.py --file sample_ddos_events.csv --batch
```

**Get Help:**
```bash
python src/misp_client.py --help
```

### Web Dashboard

#### Development
```bash
cd webapp/frontend
npm run dev
# Visit http://localhost:3000
```

#### Production Build
```bash
npm run build
npm run preview
```

## � Security & Compliance

### MISP DDoS Playbook Compliance
This system strictly follows the **Streamlined MISP DDoS Playbook** with:

#### Mandatory Event Tags (Global)
- `tlp:green` (or appropriate TLP level)
- `information-security-indicators:incident-type="ddos"`
- `misp-event-type:incident`

#### Galaxy Clusters (Global Enrichment)
- `mitre-attack-pattern:T1498` — Network DoS
- `mitre-attack-pattern:T1498.001` — Direct Flood
- `mitre-attack-pattern:T1498.002` — Amplification

#### Objects (Structured Evidence)
- `annotation` → Analyst description
- `ip-port` → Attacker/victim IPs with port context

### TLP:RED Filtering
**Critical Security Feature**: All TLP:RED classified events are automatically filtered from public dashboards to prevent sensitive information exposure.

## 🚀 Deployment

### GitHub Actions Setup
1. **Add Repository Secrets**:
   - `MISP_URL`: Your MISP instance URL
   - `MISP_API_KEY`: Your MISP API key  
   - `MISP_VERIFY_SSL`: `false` for self-signed certificates

2. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: GitHub Actions
   - The workflow will automatically deploy to Pages

3. **Automated Schedule**:
   - Business hours: Every 30 minutes (8 AM - 6 PM UTC)
   - Off-hours: Every 2 hours
   - Manual trigger available via Actions tab

### Access Your Dashboard
Once deployed, access your dashboard at:
`https://[username].github.io/misp-ddos-automation/`

## 📋 Requirements

### System Requirements
- **Python**: 3.9 or higher
- **Operating System**: Windows 10+, macOS 10.15+, Ubuntu 20.04+
- **Memory**: Minimum 2GB RAM
- **Disk Space**: 1GB free space

### MISP Instance
- **MISP Version**: 2.4.175 or higher
- **API Access**: Valid API key with event creation permissions
- **Network Access**: HTTPS connectivity to MISP instance
- **SSL Certificate**: Valid SSL certificate (recommended)

### Dependencies
See [requirements.txt](cli/requirements.txt) for complete dependency list.

## � Project Structure

```
misp-ddos-automation/
├── .github/
│   └── workflows/
│       └── refresh-misp-data.yml    # Automated data refresh
├── cli/
│   ├── src/
│   │   └── misp_client.py          # Main CLI application
│   ├── templates/                   # DDoS event templates
│   ├── requirements.txt            # Python dependencies
│   └── sample_ddos_events.csv      # Sample data for testing
├── webapp/
│   └── frontend/
│       ├── src/
│       │   ├── components/         # React components
│       │   ├── pages/             # Dashboard pages
│       │   └── theme/             # Black/yellow theme
│       ├── public/
│       │   └── data/              # Generated MISP data
│       └── package.json           # Node.js dependencies
├── docs/                          # Additional documentation
├── MISP_requirements.md           # Security requirements
├── TESTING_REPORT.md             # Validation results
└── README.md                     # This file
```

## 🔧 Development

### Adding New Features
1. Follow security-first principles from `MISP_requirements.md`
2. Add comprehensive tests for new functionality  
3. Update documentation and type hints
4. Ensure TLP compliance for any data handling

### Testing
```bash
# CLI testing
cd cli
python src/misp_client.py --test-connection

# Frontend testing
cd webapp/frontend  
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the security guidelines in `MISP_requirements.md`
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check `docs/` directory for detailed guides
- **Issues**: Report bugs via GitHub Issues
- **Security**: For security vulnerabilities, follow responsible disclosure

## 🏷️ Version History

- **v2.0.0** - Complete rewrite with React dashboard and GitHub Actions
- **v1.0.0** - Initial CLI implementation with basic MISP integration

---

**⚠️ Security Notice**: This system handles sensitive threat intelligence data. Always follow your organization's security policies and ensure proper TLP classification handling.
```

#### Interactive Mode
```bash
python cli/src/cli.py interactive
```

#### Bulk Upload from CSV
```bash
python cli/src/cli.py upload-csv --file data/ddos_events.csv
```

#### Bulk Upload from JSON
```bash
python cli/src/cli.py upload-json --file data/ddos_events.json
```

#### Search Events
```bash
# Search by tag
python cli/src/cli.py search --tag "information-security-indicators:incident-type=\"ddos\""

# Search specific event
python cli/src/cli.py search --event-id 123

# Search by organization
python cli/src/cli.py search --org "YourOrg"
```

#### Dry Run Validation
```bash
# Validate without creating events
python cli/src/cli.py upload-csv --file data/test.csv --dry-run
```

### File Formats

#### CSV Format
```csv
title,description,attacker_ips,victim_ips,attack_ports,attack_type,severity
"DDoS Attack","Volumetric attack","192.0.2.1,192.0.2.2","203.0.113.1","80,443","direct-flood","high"
```

#### JSON Format
```json
{
  "events": [
    {
      "title": "DDoS Attack",
      "description": "Large-scale volumetric attack",
      "attacker_ips": ["192.0.2.1", "192.0.2.2"],
      "victim_ips": ["203.0.113.1"],
      "attack_ports": [80, 443],
      "attack_type": "direct-flood",
      "severity": "high"
    }
  ]
}
```

See [templates/](cli/templates/) for complete examples.

## 🏗️ MISP DDoS Playbook Compliance

This tool strictly follows the **MISP DDoS Playbook** structure:

### Mandatory Global Tags
- `tlp:green` - Traffic Light Protocol
- `information-security-indicators:incident-type="ddos"` - Incident classification
- `misp-event-type:incident` - Event type classification

### MITRE ATT&CK Techniques
- `mitre-attack-pattern:T1498` - Network Denial of Service
- `mitre-attack-pattern:T1498.001` - Direct Network Flood
- `mitre-attack-pattern:T1498.002` - Reflection Amplification

### Objects Structure
- **annotation** - Analyst description (mandatory)
- **ip-port** - Attacker/victim IPs with port context
- **confidence-level:high** - Attribution confidence

### Local Workflow Tags
- `workflow:state="new"` - Internal process tracking

## 🧪 Testing

### Run Test Suite
```bash
cd tests
python -m pytest test_cli/ -v --cov=../cli/src
```

### Test Categories
- **Security Tests**: Input validation, injection prevention
- **Functionality Tests**: Core features and edge cases
- **Integration Tests**: MISP connectivity and API calls
- **Performance Tests**: File processing and memory usage

### Security Test Coverage
- ✅ Path traversal prevention
- ✅ File size limits
- ✅ Input sanitization
- ✅ SQL injection prevention
- ✅ CSV/JSON bomb protection
- ✅ IP address validation
- ✅ Port number validation

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MISP_URL` | ✅ | - | MISP instance URL |
| `MISP_API_KEY` | ✅ | - | MISP API authentication key |
| `MISP_VERIFY_SSL` | ❌ | `true` | SSL certificate verification |
| `MISP_TIMEOUT` | ❌ | `30` | Request timeout (seconds) |
| `MISP_MAX_RETRIES` | ❌ | `3` | Maximum retry attempts |

### Security Settings
- **SSL Verification**: Always enabled in production
- **Request Timeout**: Prevents hanging connections
- **Retry Logic**: Exponential backoff for resilience
- **File Size Limits**: 100MB maximum upload size

## 🚨 Security Considerations

### Known Limitations
- CSV files are processed in memory (100MB limit)
- API keys are stored in environment variables
- SSL verification can be disabled (not recommended)

### Security Best Practices
1. **Use HTTPS**: Always connect to MISP over HTTPS
2. **Rotate API Keys**: Regularly rotate MISP API keys
3. **Network Security**: Restrict network access to MISP instance
4. **Input Validation**: All user inputs are validated and sanitized
5. **File Scanning**: Scan uploaded files for malware
6. **Audit Logging**: Monitor all MISP operations

### Reporting Security Issues
Report security vulnerabilities to: security@yourorganization.com

## 🐛 Troubleshooting

### Common Issues

#### Connection Refused
```
Error: Connection failed: [Errno 111] Connection refused
```
**Solution**: Verify MISP URL and network connectivity

#### SSL Certificate Error
```
Error: SSL verification failed
```
**Solution**: Update SSL certificates or set `MISP_VERIFY_SSL=false` (not recommended)

#### Invalid API Key
```
Error: Authentication failed
```
**Solution**: Verify API key in MISP user settings

#### File Too Large
```
Error: File too large: 104857600 bytes (max: 104857600)
```
**Solution**: Split large files or increase size limit

### Debug Mode
Enable debug logging:
```bash
python cli/src/cli.py --debug <command>
```

### Log Files
- **Application Logs**: `misp_cli.log`
- **Error Logs**: Check console output
- **Debug Logs**: Enable with `--debug` flag

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Install development dependencies: `pip install -r requirements-dev.txt`
4. Run tests: `pytest`
5. Submit a pull request

### Code Standards
- **Security First**: All code must pass security review
- **Test Coverage**: Minimum 90% test coverage required
- **Documentation**: All functions must have docstrings
- **Linting**: Code must pass `pylint` and `mypy` checks
- **Formatting**: Use `black` for code formatting

### GitHub Projects Integration
This project uses GitHub Projects for task management:
- [MISP DDoS Project](https://github.com/users/PabloPenguin/projects/misp-ddos-automation)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MISP Community**: For the excellent threat intelligence platform
- **Security Researchers**: For best practices and vulnerability reports
- **Open Source Contributors**: For dependencies and tools used

## 📞 Support

- **Documentation**: [GitHub Wiki](https://github.com/PabloPenguin/misp-ddos-automation/wiki)
- **Issues**: [GitHub Issues](https://github.com/PabloPenguin/misp-ddos-automation/issues)
- **Discussions**: [GitHub Discussions](https://github.com/PabloPenguin/misp-ddos-automation/discussions)

---

**⚠️ Important**: This tool handles sensitive security data. Always follow your organization's security policies and data handling procedures.