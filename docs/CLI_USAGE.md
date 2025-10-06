# MISP CLI Usage Guide

## Overview
The MISP CLI provides secure, command-line access to your MISP instance for DDoS event management. It includes bulk processing, dashboard data export, and connection testing capabilities.

## Prerequisites
1. Python 3.9+ installed
2. Dependencies installed: `pip install -r requirements.txt`
3. MISP instance with API access
4. Valid MISP API key

## Environment Setup

### Required Environment Variables
- `MISP_URL`: Your MISP instance URL (e.g., https://misp.example.com)
- `MISP_API_KEY`: Your MISP API key

### Optional Environment Variables
- `MISP_VERIFY_SSL`: Verify SSL certificates (default: true, set to "false" for self-signed)
- `MISP_TIMEOUT`: Connection timeout in seconds (default: 30)
- `MISP_MAX_RETRIES`: Maximum retry attempts (default: 3)

### Setup Methods

#### Method 1: Use .env file (Recommended)
```bash
# Copy the template
cp .env.template .env

# Edit .env with your credentials:
MISP_URL=https://your-misp-instance.com
MISP_API_KEY=your-api-key-here
MISP_VERIFY_SSL=false  # if using self-signed certificates
```

#### Method 2: Set environment variables manually

**Windows PowerShell:**
```powershell
$env:MISP_URL="https://your-misp-instance.com"
$env:MISP_API_KEY="your-api-key-here"
$env:MISP_VERIFY_SSL="false"
```

**Linux/Mac:**
```bash
export MISP_URL="https://your-misp-instance.com"
export MISP_API_KEY="your-api-key-here"
export MISP_VERIFY_SSL="false"
```

## Available Commands

### Test Connection
Test connectivity to your MISP instance:
```bash
python src/misp_client.py --test-connection
```

### Fetch Dashboard Data
Export events for dashboard use (filters out TLP:RED events):
```bash
python src/misp_client.py --fetch-dashboard-data --output dashboard-data.json
```

### Process Files
Process CSV or JSON files containing DDoS event data:
```bash
python src/misp_client.py --file events.csv --batch
python src/misp_client.py --file events.json --auto-publish
```

### Get Help
View all available options and examples:
```bash
python src/misp_client.py --help
```

## Command Examples

### Basic Connection Test
```powershell
# Windows PowerShell
$env:MISP_URL="https://server1.tailaa85d9.ts.net"
$env:MISP_API_KEY="your-key-here"
$env:MISP_VERIFY_SSL="false"
python src\misp_client.py --test-connection
```

### Export Dashboard Data
```bash
python src/misp_client.py --fetch-dashboard-data --output ../webapp/frontend/public/data/dashboard-data.json
```

### Process Events with Tracking ID
```bash
python src/misp_client.py --file ddos_events.csv --batch --processing-id "batch-2024-001"
```

## Error Troubleshooting

### Common Issues

**"MISP_URL environment variable required"**
- Solution: Set the MISP_URL environment variable or create a .env file

**SSL Certificate Verification Failed**
- Solution: Set `MISP_VERIFY_SSL=false` for self-signed certificates

**Connection Timeout**
- Solution: Increase timeout with `MISP_TIMEOUT=60` or check network connectivity

**Invalid API Key**
- Solution: Verify your API key is correct and has proper permissions

### Log Files
The CLI creates structured logs for debugging:
- Default log level: INFO
- Set `LOG_LEVEL=DEBUG` for detailed troubleshooting
- Log file: `misp_cli.log`

## Security Notes
- Store API keys securely (use .env files, not command line arguments)
- Use SSL verification in production environments
- TLP:RED events are automatically filtered from dashboard exports
- All connections use secure HTTPS with proper certificate validation (when enabled)

## File Formats

### CSV Format
The CLI expects CSV files with headers matching the DDoS event schema:
```csv
attack_type,attacker_ips,victim_ips,attack_ports,attack_start_time,attack_duration,severity
UDP_Flood,"192.168.1.100,192.168.1.101","10.0.0.1","80,443",2024-01-01T10:00:00Z,3600,high
```

### JSON Format
```json
[
  {
    "attack_type": "UDP_Flood",
    "attacker_ips": ["192.168.1.100", "192.168.1.101"],
    "victim_ips": ["10.0.0.1"],
    "attack_ports": [80, 443],
    "attack_start_time": "2024-01-01T10:00:00Z",
    "attack_duration": 3600,
    "severity": "high"
  }
]
```