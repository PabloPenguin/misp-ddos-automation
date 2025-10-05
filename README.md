# MISP DDoS Automation Project

[![Security](https://img.shields.io/badge/security-hardened-green.svg)](https://github.com/PabloPenguin/misp-ddos-automation)
[![Python](https://img.shields.io/badge/python-3.9%2B-blue.svg)](https://python.org)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> 🛡️ **Enterprise-grade MISP DDoS event automation with defense-in-depth security**

A secure, production-ready automation system for managing DDoS events in MISP (Malware Information Sharing Platform). Designed for multi-organization collaboration with strict adherence to the MISP DDoS Playbook.

## 🎯 Purpose

This project solves the challenge of **standardized DDoS event sharing** across multiple organizations by:

- Automating MISP event creation following the official DDoS playbook
- Providing secure bulk upload capabilities for CSV/JSON data
- Ensuring consistency in event structure and taxonomy
- Enabling collaborative threat intelligence sharing

## ✨ Features

### 🔧 CLI Interface
- **Bulk Upload**: Secure CSV/JSON file processing with validation
- **Interactive Mode**: Guided event creation with input validation
- **Search & Retrieve**: Query existing DDoS events
- **Connection Testing**: Validate MISP connectivity and credentials

### 🌐 Web Application
- **Drag & Drop Upload**: User-friendly file upload interface with validation
- **Real-time Processing**: Live progress tracking and error reporting
- **Event Management**: View, create, and manage DDoS events
- **User Authentication**: Secure JWT-based authentication
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: WCAG 2.1 compliant interface

See [webapp/README.md](webapp/README.md) for setup and usage instructions.

### 🛡️ Security Features
- **Input Validation**: Comprehensive sanitization and validation
- **Path Traversal Protection**: Prevents directory traversal attacks
- **File Size Limits**: Prevents resource exhaustion
- **SQL Injection Prevention**: Parameterized queries only
- **SSL/TLS Enforcement**: Secure communication channels
- **Credential Management**: Environment-based secret handling

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

## 🚀 Installation

### 1. Clone Repository
```bash
git clone https://github.com/PabloPenguin/misp-ddos-automation.git
cd misp-ddos-automation
```

### 2. Create Virtual Environment
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies
```bash
cd cli
pip install -r requirements.txt
```

### 4. Configure Environment
Create a `.env` file in the project root:

```env
# MISP Configuration
MISP_URL=https://server1.tailaa85d9.ts.net
MISP_API_KEY=your_misp_api_key_here
MISP_VERIFY_SSL=true
MISP_TIMEOUT=30
MISP_MAX_RETRIES=3

# Optional: Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=misp_cli.log
```

**🔒 Security Note**: Never commit the `.env` file to version control!

## 📖 Usage

### Web Application

The web application provides a modern, user-friendly interface for managing DDoS events.

#### Quick Start
```bash
cd webapp
npm install
npm run dev
```

The application will be available at `http://localhost:5173`

#### Features
- **Authentication**: Secure login with JWT tokens
- **File Upload**: Drag & drop CSV/JSON files with real-time validation
- **Progress Tracking**: Monitor file processing with live updates
- **Event Management**: View, create, and manage events in a table
- **Responsive UI**: Works seamlessly on desktop and mobile

For detailed documentation, see [webapp/README.md](webapp/README.md) and [webapp/ARCHITECTURE.md](webapp/ARCHITECTURE.md).

### CLI Commands

#### Test Connection
```bash
python cli/src/cli.py test-connection
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