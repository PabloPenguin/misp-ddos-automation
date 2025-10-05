#!/usr/bin/env python3
"""
MISP DDoS Automation CLI

Secure command-line interface for managing DDoS events in MISP.
Supports bulk uploads, interactive mode, and follows the MISP DDoS Playbook.
"""

import sys
import csv
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any
import click
import structlog
from pydantic import ValidationError

from misp_client import SecureMISPClient, DDoSEventData, SecurityError


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('misp_cli.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = structlog.get_logger(__name__)


class CLIError(Exception):
    """CLI-specific error handling."""
    pass


def validate_file_path(filepath: str, allowed_extensions: List[str] = None) -> Path:
    """
    Validate file path with security checks.
    
    Args:
        filepath: Input file path
        allowed_extensions: List of allowed file extensions
        
    Returns:
        Validated Path object
        
    Raises:
        CLIError: If file validation fails
    """
    if not isinstance(filepath, (str, Path)):
        raise CLIError(f"Invalid file path type: {type(filepath)}")
    
    try:
        # Canonicalize path to prevent traversal attacks
        filepath = Path(filepath).resolve()
        
        # Check if file exists
        if not filepath.exists():
            raise CLIError(f"File does not exist: {filepath}")
        
        # Check if it's actually a file
        if not filepath.is_file():
            raise CLIError(f"Path is not a file: {filepath}")
        
        # Check file extension if specified
        if allowed_extensions:
            if filepath.suffix.lower() not in [ext.lower() for ext in allowed_extensions]:
                raise CLIError(f"File extension not allowed. Allowed: {allowed_extensions}")
        
        # Check file size (max 100MB)
        file_size = filepath.stat().st_size
        max_size = 100 * 1024 * 1024  # 100MB
        if file_size > max_size:
            raise CLIError(f"File too large: {file_size} bytes (max: {max_size})")
        
        logger.info("File validation passed", filepath=str(filepath), size_bytes=file_size)
        return filepath
        
    except OSError as e:
        raise CLIError(f"File system error: {e}")


def parse_csv_file(filepath: Path) -> List[Dict[str, Any]]:
    """
    Securely parse CSV file with DDoS event data.
    
    Expected CSV format:
    title,description,attacker_ips,victim_ips,attack_ports,attack_type,severity
    
    Args:
        filepath: Path to CSV file
        
    Returns:
        List of parsed event dictionaries
        
    Raises:
        CLIError: If CSV parsing fails
    """
    try:
        events = []
        
        with open(filepath, 'r', encoding='utf-8', newline='') as csvfile:
            # Detect dialect to handle different CSV formats
            sample = csvfile.read(1024)
            csvfile.seek(0)
            dialect = csv.Sniffer().sniff(sample)
            
            reader = csv.DictReader(csvfile, dialect=dialect)
            
            # Validate required columns
            required_columns = {'title', 'description', 'attacker_ips', 'victim_ips'}
            if not required_columns.issubset(reader.fieldnames or []):
                missing = required_columns - set(reader.fieldnames or [])
                raise CLIError(f"Missing required CSV columns: {missing}")
            
            row_count = 0
            for row_num, row in enumerate(reader, start=2):  # Start at 2 for header
                try:
                    # Parse IP addresses (comma-separated)
                    attacker_ips = [ip.strip() for ip in row['attacker_ips'].split(',') if ip.strip()]
                    victim_ips = [ip.strip() for ip in row['victim_ips'].split(',') if ip.strip()]
                    
                    # Parse ports if provided
                    attack_ports = []
                    if row.get('attack_ports'):
                        attack_ports = [
                            int(port.strip()) 
                            for port in row['attack_ports'].split(',') 
                            if port.strip().isdigit()
                        ]
                    
                    event_data = {
                        'title': row['title'].strip(),
                        'description': row['description'].strip(),
                        'attacker_ips': attacker_ips,
                        'victim_ips': victim_ips,
                        'attack_ports': attack_ports,
                        'attack_type': row.get('attack_type', 'direct-flood').strip(),
                        'severity': row.get('severity', 'medium').strip()
                    }
                    
                    events.append(event_data)
                    row_count += 1
                    
                    # Limit number of events to prevent memory issues
                    if row_count > 1000:
                        logger.warning("CSV file too large, processing first 1000 events")
                        break
                        
                except Exception as e:
                    logger.warning(f"Skipping invalid row {row_num}: {e}")
                    continue
        
        logger.info(f"Parsed CSV file", events_count=len(events), filepath=str(filepath))
        return events
        
    except Exception as e:
        raise CLIError(f"CSV parsing failed: {e}")


def parse_json_file(filepath: Path) -> List[Dict[str, Any]]:
    """
    Securely parse JSON file with DDoS event data.
    
    Expected JSON format:
    {
        "events": [
            {
                "title": "DDoS Attack",
                "description": "...",
                "attacker_ips": ["1.2.3.4"],
                "victim_ips": ["5.6.7.8"],
                ...
            }
        ]
    }
    
    Args:
        filepath: Path to JSON file
        
    Returns:
        List of parsed event dictionaries
        
    Raises:
        CLIError: If JSON parsing fails
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as jsonfile:
            data = json.load(jsonfile)
        
        # Handle different JSON structures
        if isinstance(data, list):
            events = data
        elif isinstance(data, dict) and 'events' in data:
            events = data['events']
        else:
            raise CLIError("JSON must be a list of events or contain 'events' key")
        
        if not isinstance(events, list):
            raise CLIError("Events data must be a list")
        
        # Limit number of events
        if len(events) > 1000:
            logger.warning("JSON file too large, processing first 1000 events")
            events = events[:1000]
        
        logger.info(f"Parsed JSON file", events_count=len(events), filepath=str(filepath))
        return events
        
    except json.JSONDecodeError as e:
        raise CLIError(f"Invalid JSON format: {e}")
    except Exception as e:
        raise CLIError(f"JSON parsing failed: {e}")


@click.group()
@click.option('--debug', is_flag=True, help='Enable debug logging')
@click.pass_context
def cli(ctx, debug):
    """MISP DDoS Automation CLI - Secure management of DDoS events."""
    ctx.ensure_object(dict)
    
    if debug:
        logging.getLogger().setLevel(logging.DEBUG)
        logger.info("Debug logging enabled")


@click.command()
@click.option('--file', '-f', required=True, help='CSV file path')
@click.option('--dry-run', is_flag=True, help='Validate data without creating events')
@click.pass_context
def upload_csv(ctx, file, dry_run):
    """Upload DDoS events from CSV file."""
    try:
        # Validate file
        filepath = validate_file_path(file, ['.csv'])
        
        # Parse CSV
        events_data = parse_csv_file(filepath)
        
        if not events_data:
            click.echo("No valid events found in CSV file", err=True)
            return
        
        if dry_run:
            click.echo(f"✓ CSV validation successful: {len(events_data)} events found")
            return
        
        # Initialize MISP client
        try:
            client = SecureMISPClient()
        except Exception as e:
            raise CLIError(f"Failed to initialize MISP client: {e}")
        
        # Create events
        success_count = 0
        error_count = 0
        
        with click.progressbar(events_data, label='Creating events') as events:
            for event_data in events:
                try:
                    # Validate event data
                    validated_data = DDoSEventData(**event_data)
                    
                    # Create event in MISP
                    result = client.create_ddos_event(validated_data)
                    
                    if result.get('success'):
                        success_count += 1
                        logger.info(f"Event created", event_id=result.get('event_id'))
                    else:
                        error_count += 1
                        logger.error(f"Event creation failed", result=result)
                        
                except ValidationError as e:
                    error_count += 1
                    logger.error(f"Event validation failed", errors=e.errors())
                except Exception as e:
                    error_count += 1
                    logger.error(f"Unexpected error creating event", error=str(e))
        
        click.echo(f"✓ Upload completed: {success_count} successful, {error_count} errors")
        
    except CLIError as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)
    except Exception as e:
        click.echo(f"Unexpected error: {e}", err=True)
        sys.exit(1)


@click.command()
@click.option('--file', '-f', required=True, help='JSON file path')
@click.option('--dry-run', is_flag=True, help='Validate data without creating events')
@click.pass_context
def upload_json(ctx, file, dry_run):
    """Upload DDoS events from JSON file."""
    try:
        # Validate file
        filepath = validate_file_path(file, ['.json'])
        
        # Parse JSON
        events_data = parse_json_file(filepath)
        
        if not events_data:
            click.echo("No valid events found in JSON file", err=True)
            return
        
        if dry_run:
            click.echo(f"✓ JSON validation successful: {len(events_data)} events found")
            return
        
        # Initialize MISP client
        try:
            client = SecureMISPClient()
        except Exception as e:
            raise CLIError(f"Failed to initialize MISP client: {e}")
        
        # Create events
        success_count = 0
        error_count = 0
        
        with click.progressbar(events_data, label='Creating events') as events:
            for event_data in events:
                try:
                    # Validate event data
                    validated_data = DDoSEventData(**event_data)
                    
                    # Create event in MISP
                    result = client.create_ddos_event(validated_data)
                    
                    if result.get('success'):
                        success_count += 1
                        logger.info(f"Event created", event_id=result.get('event_id'))
                    else:
                        error_count += 1
                        logger.error(f"Event creation failed", result=result)
                        
                except ValidationError as e:
                    error_count += 1
                    logger.error(f"Event validation failed", errors=e.errors())
                except Exception as e:
                    error_count += 1
                    logger.error(f"Unexpected error creating event", error=str(e))
        
        click.echo(f"✓ Upload completed: {success_count} successful, {error_count} errors")
        
    except CLIError as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)
    except Exception as e:
        click.echo(f"Unexpected error: {e}", err=True)
        sys.exit(1)


@click.command()
@click.pass_context
def interactive(ctx):
    """Interactive mode for creating DDoS events."""
    try:
        click.echo("🛡️  MISP DDoS Event Creator - Interactive Mode")
        click.echo("=" * 50)
        
        # Collect event information
        title = click.prompt("Event title", type=str)
        description = click.prompt("Event description", type=str)
        
        # Collect attacker IPs
        attacker_ips = []
        click.echo("\nEnter attacker IP addresses (press Enter when done):")
        while True:
            ip = click.prompt("Attacker IP", default="", show_default=False)
            if not ip.strip():
                break
            attacker_ips.append(ip.strip())
        
        if not attacker_ips:
            click.echo("At least one attacker IP is required", err=True)
            return
        
        # Collect victim IPs
        victim_ips = []
        click.echo("\nEnter victim IP addresses (press Enter when done):")
        while True:
            ip = click.prompt("Victim IP", default="", show_default=False)
            if not ip.strip():
                break
            victim_ips.append(ip.strip())
        
        if not victim_ips:
            click.echo("At least one victim IP is required", err=True)
            return
        
        # Collect attack ports (optional)
        attack_ports = []
        if click.confirm("Add attack ports?"):
            while True:
                try:
                    port = click.prompt("Port number", type=int, default=0, show_default=False)
                    if port == 0:
                        break
                    if 1 <= port <= 65535:
                        attack_ports.append(port)
                    else:
                        click.echo("Port must be between 1 and 65535")
                except click.Abort:
                    break
        
        # Attack type
        attack_type = click.prompt(
            "Attack type",
            type=click.Choice(['direct-flood', 'amplification', 'reflection']),
            default='direct-flood'
        )
        
        # Severity
        severity = click.prompt(
            "Severity",
            type=click.Choice(['low', 'medium', 'high', 'critical']),
            default='medium'
        )
        
        # Create event data
        event_data = DDoSEventData(
            title=title,
            description=description,
            attacker_ips=attacker_ips,
            victim_ips=victim_ips,
            attack_ports=attack_ports,
            attack_type=attack_type,
            severity=severity
        )
        
        # Display summary
        click.echo("\n" + "=" * 50)
        click.echo("Event Summary:")
        click.echo(f"Title: {event_data.title}")
        click.echo(f"Description: {event_data.description}")
        click.echo(f"Attacker IPs: {', '.join(event_data.attacker_ips)}")
        click.echo(f"Victim IPs: {', '.join(event_data.victim_ips)}")
        if event_data.attack_ports:
            click.echo(f"Attack Ports: {', '.join(map(str, event_data.attack_ports))}")
        click.echo(f"Attack Type: {event_data.attack_type}")
        click.echo(f"Severity: {event_data.severity}")
        click.echo("=" * 50)
        
        if not click.confirm("Create this event in MISP?"):
            click.echo("Event creation cancelled")
            return
        
        # Initialize MISP client and create event
        try:
            client = SecureMISPClient()
            result = client.create_ddos_event(event_data)
            
            if result.get('success'):
                click.echo(f"✓ Event created successfully!")
                click.echo(f"Event ID: {result.get('event_id')}")
            else:
                click.echo(f"✗ Event creation failed: {result}", err=True)
                
        except Exception as e:
            click.echo(f"✗ Error creating event: {e}", err=True)
        
    except click.Abort:
        click.echo("\nOperation cancelled")
    except Exception as e:
        click.echo(f"Unexpected error: {e}", err=True)
        sys.exit(1)


@click.command()
@click.option('--event-id', '-e', help='Specific event ID to search for')
@click.option('--tag', '-t', help='Search by tag')
@click.option('--org', '-o', help='Search by organization')
@click.option('--limit', '-l', default=10, help='Maximum number of results')
@click.pass_context
def search(ctx, event_id, tag, org, limit):
    """Search for existing DDoS events."""
    try:
        client = SecureMISPClient()
        
        if event_id:
            # Search for specific event
            result = client.get_event_by_id(event_id)
            if result:
                click.echo(f"Event {event_id} found:")
                click.echo(f"Title: {result.get('Event', {}).get('info', 'N/A')}")
                click.echo(f"Date: {result.get('Event', {}).get('date', 'N/A')}")
            else:
                click.echo(f"Event {event_id} not found")
        else:
            # General search
            search_params = {}
            if tag:
                search_params['tags'] = tag
            if org:
                search_params['org'] = org
            
            # Add DDoS-specific search if no specific params
            if not search_params:
                search_params['tags'] = 'information-security-indicators:incident-type="ddos"'
            
            results = client.search_events(search_params)
            
            if not results:
                click.echo("No events found")
                return
            
            # Display results (limit to prevent overwhelming output)
            results = results[:limit]
            click.echo(f"Found {len(results)} events:")
            click.echo("-" * 60)
            
            for event in results:
                event_info = event.get('Event', {})
                click.echo(f"ID: {event_info.get('id', 'N/A')}")
                click.echo(f"Title: {event_info.get('info', 'N/A')}")
                click.echo(f"Date: {event_info.get('date', 'N/A')}")
                click.echo(f"Org: {event_info.get('Orgc', {}).get('name', 'N/A')}")
                click.echo("-" * 30)
        
    except Exception as e:
        click.echo(f"Search failed: {e}", err=True)
        sys.exit(1)


@click.command()
@click.pass_context
def test_connection(ctx):
    """Test connection to MISP instance."""
    try:
        click.echo("Testing MISP connection...")
        
        client = SecureMISPClient()
        
        # Test connection using the same method as create_ddos_event
        misp = client._connect()
        
        click.echo("✓ Connection successful!")
        click.echo(f"MISP Server: {client.config.misp_url}")
        click.echo("✓ Authentication validated!")
        
    except SecurityError as e:
        click.echo(f"✗ Security error: {e}", err=True)
        sys.exit(1)
    except Exception as e:
        click.echo(f"✗ Connection failed: {e}", err=True)
        sys.exit(1)


# Add commands to CLI group
cli.add_command(upload_csv)
cli.add_command(upload_json)
cli.add_command(interactive)
cli.add_command(search)
cli.add_command(test_connection)


if __name__ == '__main__':
    cli()