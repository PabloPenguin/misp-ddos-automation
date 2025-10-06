# 🛠️ CLI Documentation

## Overview

The MISP DDoS CLI provides secure, enterprise-grade command-line tools for managing DDoS events in MISP instances. Built with defense-in-depth security principles and comprehensive error handling.

## 🚀 Quick Start

### Installation
```bash
cd cli
pip install -r requirements.txt
```

### Basic Usage
```bash
# Test your MISP connection
python src/misp_client.py --test-connection

# Upload events from CSV
python src/misp_client.py --bulk-upload sample_ddos_events.csv

# Interactive event creation
python src/misp_client.py --interactive

# Generate dashboard data
python src/misp_client.py --fetch-dashboard-data --output ../webapp/frontend/public/data/dashboard-data.json
```

## 📋 Command Reference

### Connection Testing
```bash
python src/misp_client.py --test-connection
```
Validates connectivity to your MISP instance and verifies API credentials.

**Output:**
- ✅ Connection successful with MISP version
- ❌ Connection failed with detailed error

### Bulk Upload
```bash
python src/misp_client.py --bulk-upload <file>
```

**Supported Formats:**
- **CSV**: Comma-separated values with headers
- **JSON**: Structured event data

**Security Features:**
- File size validation (max 10MB)
- Path traversal prevention  
- Input sanitization
- TLP classification validation

### Interactive Mode
```bash
python src/misp_client.py --interactive
```

Guided event creation with:
- Step-by-step prompts
- Input validation
- DDoS playbook compliance
- Real-time error checking

### Dashboard Data Generation
```bash
python src/misp_client.py --fetch-dashboard-data --output <file>
```

Generates filtered JSON data for the web dashboard:
- **TLP:RED Filtering**: Automatically excludes sensitive events
- **Statistics**: Threat level distributions, attack types
- **Time Series**: Daily event counts for trending
- **Security**: Validates all data before output

## 📊 Data Formats

### CSV Format
Create a CSV file with these required columns:

```csv
event_info,threat_level,tlp,attack_type,attacker_ips,victim_ips,attack_ports,tags,description
"DDoS Attack against Financial Institution",High,TLP:WHITE,Volumetric,"192.168.1.100,10.0.0.50",203.0.113.10,"80,443","ddos,financial,volumetric","High-volume attack targeting banking services"
"Application Layer DDoS - HTTP Flood",Medium,TLP:GREEN,Application Layer,172.16.0.25,198.51.100.15,"80,8080","ddos,http-flood,application-layer","Sustained HTTP request flood"
```

**Required Columns:**
- `event_info`: Event description
- `threat_level`: High/Medium/Low
- `tlp`: TLP:WHITE/GREEN/AMBER/RED
- `attack_type`: Volumetric/Protocol/Application Layer/Reflection
- `attacker_ips`: Comma-separated IP addresses
- `victim_ips`: Comma-separated target IPs
- `attack_ports`: Comma-separated port numbers
- `tags`: Comma-separated tags
- `description`: Detailed analysis

### JSON Format
```json
{
  "events": [
    {
      "info": "DDoS Attack against Financial Institution",
      "threat_level": "High",
      "tlp": "TLP:WHITE",
      "attack_type": "Volumetric", 
      "attacker_ips": ["192.168.1.100", "10.0.0.50"],
      "victim_ips": ["203.0.113.10"],
      "attack_ports": [80, 443],
      "tags": ["ddos", "financial", "volumetric"],
      "description": "High-volume attack targeting banking services"
    }
  ]
}
```

## 🛡️ Security Features

### Input Validation
- **IP Address Validation**: Ensures valid IPv4/IPv6 formats
- **Port Range Validation**: Validates port numbers (1-65535)
- **TLP Classification**: Enforces proper TLP taxonomy
- **File Size Limits**: Prevents resource exhaustion attacks

### TLP:RED Filtering
**Critical Security Control**: Events classified as TLP:RED are:
- Excluded from dashboard data generation
- Logged for audit purposes
- Never exposed in public interfaces
- Handled according to MISP security policies

### Error Handling
- **Graceful Degradation**: Continues processing on non-critical errors
- **Detailed Logging**: Structured logs for troubleshooting
- **Retry Logic**: Automatic retry with exponential backoff
- **Connection Timeouts**: Prevents hanging operations

## 🔧 Configuration

### Environment Variables
```bash
# Required
MISP_URL=https://your-misp-instance.com
MISP_API_KEY=your-api-key-here

# Optional
MISP_VERIFY_SSL=true          # SSL certificate verification
MISP_TIMEOUT=30               # Request timeout in seconds
MISP_MAX_RETRIES=3           # Maximum retry attempts
LOG_LEVEL=INFO               # Logging level
LOG_FILE=misp_cli.log        # Log file location
```

### .env File
Create a `.env` file in the project root:
```env
MISP_URL=https://server1.tailaa85d9.ts.net
MISP_API_KEY=your_actual_api_key_here
MISP_VERIFY_SSL=false
```

**🔒 Security Warning**: Never commit `.env` files to version control!

## 📁 Sample Files

### Sample CSV (`sample_ddos_events.csv`)
Located in the CLI directory, contains example DDoS events for testing:
- Various attack types (Volumetric, Protocol, Application Layer)
- Different TLP levels (WHITE, GREEN, AMBER)
- Realistic IP addresses and port combinations
- Proper tag structures

### Templates (`templates/`)
Pre-configured JSON templates for common DDoS scenarios:
- `volumetric_attack.json`: High-volume attacks
- `application_layer.json`: Layer 7 attacks  
- `reflection_amplification.json`: DNS/NTP reflection attacks
- `protocol_attack.json`: TCP/UDP protocol attacks

## 🚨 Troubleshooting

### Common Issues

#### Connection Refused
```
Error: Connection refused to MISP instance
```
**Solutions:**
- Verify MISP_URL is correct and accessible
- Check network connectivity to MISP instance
- Ensure MISP instance is running

#### SSL Certificate Errors  
```
Error: SSL certificate verification failed
```
**Solutions:**
- Set `MISP_VERIFY_SSL=false` for self-signed certificates
- Install proper SSL certificates on MISP instance
- Use a certificate authority (CA) bundle

#### API Key Invalid
```
Error: Authentication failed - invalid API key
```
**Solutions:**
- Verify API key in MISP user settings
- Ensure user has proper permissions
- Check for typos in MISP_API_KEY

#### File Upload Errors
```
Error: Failed to process CSV file
```
**Solutions:**
- Verify CSV format matches required columns
- Check file encoding (UTF-8 recommended)
- Ensure file size is under 10MB limit

### Debug Mode
Enable detailed logging:
```bash
export LOG_LEVEL=DEBUG
python src/misp_client.py --test-connection
```

### Validation Mode
Test CSV files without uploading:
```bash
python src/misp_client.py --validate-csv sample_ddos_events.csv
```

## 🔄 Integration

### GitHub Actions
The CLI integrates with GitHub Actions for automated workflows:
```yaml
- name: Fetch MISP Data
  env:
    MISP_URL: ${{ secrets.MISP_URL }}
    MISP_API_KEY: ${{ secrets.MISP_API_KEY }}
    MISP_VERIFY_SSL: ${{ secrets.MISP_VERIFY_SSL }}
  run: |
    cd cli
    python src/misp_client.py --fetch-dashboard-data --output ../webapp/frontend/public/data/dashboard-data.json
```

### Scripting
Example Python integration:
```python
import subprocess
import os

# Set environment
os.environ['MISP_URL'] = 'https://your-misp.com'
os.environ['MISP_API_KEY'] = 'your-key'

# Run CLI command
result = subprocess.run([
    'python', 'src/misp_client.py', 
    '--bulk-upload', 'events.csv'
], capture_output=True, text=True)

if result.returncode == 0:
    print("Upload successful!")
else:
    print(f"Error: {result.stderr}")
```

## 📈 Performance

### Optimization Tips
- **Batch Processing**: Upload multiple events in single API calls
- **Connection Pooling**: Reuse MISP connections when possible
- **Parallel Processing**: Use multiple workers for large datasets
- **Caching**: Cache MISP instance metadata

### Monitoring
- Monitor API rate limits
- Track upload success rates
- Log processing times
- Alert on error patterns

---

## 🆘 Support

For CLI-specific support:
1. Check the troubleshooting section above
2. Review log files for detailed error messages
3. Validate your CSV/JSON format against samples
4. Test connection before bulk operations

**Security Issues**: Report security vulnerabilities through proper channels, not public issues.