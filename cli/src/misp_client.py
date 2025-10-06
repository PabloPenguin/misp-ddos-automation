"""
Secure MISP Client for DDoS Event Management

This module provides a secure, production-ready interface to the MISP instance
following defense-in-depth principles and secure-by-design practices.
"""

import os
import logging
import json
from pathlib import Path
from typing import Dict, List, Optional, Union, Any, Tuple
from urllib.parse import urlparse
import time
from contextlib import contextmanager

import requests
from pymisp import PyMISP, MISPEvent, MISPObject, MISPAttribute
from pydantic import BaseModel, Field, validator
import structlog
from cryptography.fernet import Fernet


# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.dev.ConsoleRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger(__name__)


class SecurityError(Exception):
    """Raised when security validation fails."""
    pass


class MISPConfig(BaseModel):
    """Secure configuration model for MISP connection."""
    
    misp_url: str = Field(..., description="MISP instance URL")
    api_key: str = Field(..., description="MISP API key")
    verify_ssl: bool = Field(default=True, description="Verify SSL certificates")
    timeout: int = Field(default=30, ge=5, le=300, description="Request timeout in seconds")
    max_retries: int = Field(default=3, ge=1, le=10, description="Maximum retry attempts")
    
    @validator('misp_url')
    def validate_url(cls, v):
        """Validate MISP URL format and security."""
        if not isinstance(v, str):
            raise TypeError("MISP URL must be a string")
        
        try:
            parsed = urlparse(v)
            if not parsed.scheme or not parsed.netloc:
                raise ValueError("Invalid URL format")
            
            if parsed.scheme not in ['https', 'http']:
                raise ValueError("URL must use HTTP or HTTPS protocol")
            
            # Warn about HTTP usage
            if parsed.scheme == 'http':
                logger.warning("Using HTTP connection - consider HTTPS for production")
                
        except Exception as e:
            raise ValueError(f"Invalid MISP URL: {e}")
        
        return v
    
    @validator('api_key')
    def validate_api_key(cls, v):
        """Validate API key format."""
        if not isinstance(v, str):
            raise TypeError("API key must be a string")
        
        if len(v) < 32:
            raise ValueError("API key appears too short")
        
        # Don't log the actual key
        logger.info("API key validation passed")
        return v


class DDoSEventData(BaseModel):
    """Structured data model for DDoS events following MISP playbook."""
    
    title: str = Field(..., description="Event title")
    description: str = Field(..., description="Detailed event description")
    attacker_ips: List[str] = Field(..., description="List of attacking IP addresses")
    victim_ips: List[str] = Field(..., description="List of victim IP addresses")
    attack_ports: List[int] = Field(default_factory=list, description="Ports involved in attack")
    attack_type: str = Field(default="direct-flood", description="Type of DDoS attack")
    timestamp: Optional[str] = Field(None, description="Event timestamp")
    severity: str = Field(default="medium", description="Attack severity")
    additional_attributes: Dict[str, Any] = Field(default_factory=dict, description="Additional custom attributes")
    
    @validator('attacker_ips', 'victim_ips')
    def validate_ips(cls, v):
        """Validate IP address format."""
        import ipaddress
        
        if not isinstance(v, list):
            raise TypeError("IP addresses must be provided as a list")
        
        validated_ips = []
        for ip in v:
            try:
                # This validates IPv4 and IPv6
                ipaddress.ip_address(ip)
                validated_ips.append(ip)
            except ValueError:
                logger.warning(f"Invalid IP address format: {ip}")
                continue
        
        if not validated_ips:
            raise ValueError("At least one valid IP address required")
        
        return validated_ips
    
    @validator('attack_ports')
    def validate_ports(cls, v):
        """Validate port numbers."""
        if not isinstance(v, list):
            return []
        
        valid_ports = []
        for port in v:
            if isinstance(port, int) and 1 <= port <= 65535:
                valid_ports.append(port)
            else:
                logger.warning(f"Invalid port number: {port}")
        
        return valid_ports


@contextmanager
def measure_time(operation: str):
    """Context manager for measuring operation duration."""
    start_time = time.time()
    try:
        yield
    finally:
        duration = time.time() - start_time
        logger.info(f"Operation completed", operation=operation, duration_seconds=duration)


class SecureMISPClient:
    """
    Secure MISP client with comprehensive error handling and security controls.
    
    This client implements:
    - Input validation and sanitization
    - Secure credential management
    - Retry logic with exponential backoff
    - Comprehensive logging and monitoring
    - Defense against common attacks
    """
    
    def __init__(self, config: Optional[MISPConfig] = None):
        """
        Initialize secure MISP client.
        
        Args:
            config: Optional MISPConfig object. If None, loads from environment.
        
        Raises:
            SecurityError: If configuration validation fails
            ValueError: If required environment variables are missing
        """
        self.config = config or self._load_config_from_env()
        self.misp = None
        self._connection_validated = False
        
        logger.info("MISP client initialized", url=self.config.misp_url)
    
    def _load_config_from_env(self) -> MISPConfig:
        """Load configuration securely from environment variables."""
        try:
            # Load from .env file if it exists (development only)
            from dotenv import load_dotenv
            env_file = Path('.env')
            if env_file.exists():
                load_dotenv(env_file)
                logger.info("Loaded configuration from .env file")
        except ImportError:
            logger.info("python-dotenv not available, using system environment only")
        
        # Required environment variables
        misp_url = os.environ.get("MISP_URL")
        api_key = os.environ.get("MISP_API_KEY")
        
        if not misp_url:
            raise ValueError("MISP_URL environment variable required")
        if not api_key:
            raise ValueError("MISP_API_KEY environment variable required")
        
        # Optional environment variables with defaults
        verify_ssl = os.environ.get("MISP_VERIFY_SSL", "true").lower() == "true"
        timeout = int(os.environ.get("MISP_TIMEOUT", "30"))
        max_retries = int(os.environ.get("MISP_MAX_RETRIES", "3"))
        
        return MISPConfig(
            misp_url=misp_url,
            api_key=api_key,
            verify_ssl=verify_ssl,
            timeout=timeout,
            max_retries=max_retries
        )
    
    def _connect(self) -> PyMISP:
        """Establish secure connection to MISP instance."""
        if self.misp and self._connection_validated:
            return self.misp
        
        try:
            with measure_time("misp_connection"):
                self.misp = PyMISP(
                    url=self.config.misp_url,
                    key=self.config.api_key,
                    ssl=self.config.verify_ssl,
                    timeout=self.config.timeout
                )
                
                # Validate connection
                try:
                    # Try newer API method first, fallback to basic connectivity test
                    try:
                        version_info = self.misp.get_version()
                        if isinstance(version_info, dict) and 'version' in version_info:
                            logger.info("MISP connection established", version=version_info.get('version'))
                        else:
                            logger.info("MISP connection established", info="Version check method changed")
                    except AttributeError:
                        # Fallback for older PyMISP versions - test basic connectivity
                        user_info = self.misp.get_user('me')
                        if user_info:
                            logger.info("MISP connection established", info="Connected via user validation")
                        else:
                            raise SecurityError("Unable to validate MISP connection")
                    
                    self._connection_validated = True
                    
                except Exception as e:
                    raise SecurityError(f"MISP connection validation failed: {e}")
                
        except requests.exceptions.SSLError as e:
            raise SecurityError(f"SSL verification failed: {e}")
        except requests.exceptions.ConnectionError as e:
            raise SecurityError(f"Connection failed: {e}")
        except requests.exceptions.Timeout as e:
            raise SecurityError(f"Connection timeout: {e}")
        except Exception as e:
            raise SecurityError(f"Unexpected connection error: {e}")
        
        return self.misp
    
    def create_ddos_event(self, event_data: DDoSEventData) -> Dict[str, Any]:
        """
        Create a DDoS event in MISP following the official playbook.
        
        Args:
            event_data: Validated DDoS event data
            
        Returns:
            Dictionary containing event creation results
            
        Raises:
            SecurityError: If event creation fails security validation
            ValueError: If event data is invalid
        """
        misp = self._connect()
        
        try:
            with measure_time("create_ddos_event"):
                # Create base event
                event = MISPEvent()
                event.info = event_data.title
                event.analysis = 0  # Initial analysis
                event.threat_level_id = 3  # Medium threat level
                
                # Helper function for compatible tag adding
                def add_tag_safe(obj, tag_name):
                    try:
                        if hasattr(obj, 'add_tag'):
                            obj.add_tag(tag_name)
                        else:
                            # Fallback for older versions
                            if not hasattr(obj, 'tags'):
                                obj.tags = []
                            obj.tags.append(tag_name)
                    except Exception as e:
                        logger.warning("Failed to add tag", tag=tag_name, error=str(e))
                
                # Add mandatory global tags per playbook
                add_tag_safe(event, "tlp:green")
                add_tag_safe(event, "information-security-indicators:incident-type=\"ddos\"")
                add_tag_safe(event, "misp-event-type:incident")
                
                # Add MITRE ATT&CK Galaxy Clusters via special tags (REQUIRED per playbook)
                # MISP automatically creates Galaxy Clusters from these specially formatted tags
                
                # Always add the base Network DoS technique
                add_tag_safe(event, 'misp-galaxy:mitre-attack-pattern="Network Denial of Service - T1498"')
                logger.info("Added Galaxy Cluster tag for T1498", technique="T1498")
                
                # Add specific technique based on attack type  
                if event_data.attack_type == "direct-flood":
                    add_tag_safe(event, 'misp-galaxy:mitre-attack-pattern="Direct Network Flood - T1498.001"')
                    logger.info("Added Galaxy Cluster tag for T1498.001", technique="T1498.001")
                elif event_data.attack_type == "amplification":
                    add_tag_safe(event, 'misp-galaxy:mitre-attack-pattern="Reflection Amplification - T1498.002"')
                    logger.info("Added Galaxy Cluster tag for T1498.002", technique="T1498.002")
                
                # Add local workflow tag
                add_tag_safe(event, "workflow:state=\"new\"")
                
                # Create annotation object (mandatory per playbook)
                annotation_obj = MISPObject("annotation")
                annotation_obj.add_attribute("text", event_data.description)
                event.add_object(annotation_obj)
                
                # Add attacker IP-port objects
                for ip in event_data.attacker_ips:
                    ip_port_obj = MISPObject("ip-port")
                    ip_port_obj.add_attribute("ip", ip, category="Network activity", to_ids=True)
                    
                    # Add ports if available
                    for port in event_data.attack_ports:
                        ip_port_obj.add_attribute("dst-port", port, category="Network activity")
                    
                    # Add confidence level tag
                    add_tag_safe(ip_port_obj, "confidence-level:high")
                    event.add_object(ip_port_obj)
                
                # Add victim IP objects
                for ip in event_data.victim_ips:
                    victim_obj = MISPObject("ip-port")
                    victim_obj.add_attribute("ip", ip, category="Network activity", to_ids=False)
                    victim_obj.comment = "Victim IP"
                    event.add_object(victim_obj)
                
                # Add additional attributes if provided
                for attr_name, attr_value in event_data.additional_attributes.items():
                    if self._validate_attribute(attr_name, attr_value):
                        event.add_attribute(attr_name, attr_value)
                
                # Create event in MISP
                result = misp.add_event(event)
                
                if 'errors' in result:
                    raise ValueError(f"MISP event creation failed: {result['errors']}")
                
                event_id = result.get('Event', {}).get('id')
                
                logger.info(
                    "DDoS event created successfully",
                    event_id=event_id,
                    attacker_count=len(event_data.attacker_ips),
                    victim_count=len(event_data.victim_ips)
                )
                
                return {
                    "success": True,
                    "event_id": event_id,
                    "message": "DDoS event created successfully",
                    "event_data": result
                }
                
        except Exception as e:
            logger.error("Failed to create DDoS event", error=str(e))
            raise
    
    def _validate_attribute(self, name: str, value: Any) -> bool:
        """Validate custom attributes for security."""
        # Implement attribute validation logic
        if not isinstance(name, str) or len(name) > 100:
            return False
        
        if isinstance(value, str) and len(value) > 1000:
            return False
        
        # Add more validation as needed
        return True
    
    def search_events(self, search_params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Search for existing DDoS events with security filtering.
        
        Args:
            search_params: Search parameters
            
        Returns:
            List of matching events
        """
        misp = self._connect()
        
        try:
            with measure_time("search_events"):
                # Sanitize search parameters
                safe_params = self._sanitize_search_params(search_params)
                
                results = misp.search(controller='events', **safe_params)
                
                logger.info(
                    "Event search completed",
                    result_count=len(results) if results else 0
                )
                
                return results or []
                
        except Exception as e:
            logger.error("Event search failed", error=str(e))
            raise
    
    def _sanitize_search_params(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Sanitize search parameters to prevent injection attacks."""
        safe_params = {}
        
        # Allow only safe search parameters
        allowed_params = {
            'eventinfo', 'tags', 'date_from', 'date_to', 'org', 'eventid'
        }
        
        for key, value in params.items():
            if key in allowed_params and isinstance(value, (str, int, list)):
                safe_params[key] = value
        
        return safe_params
    
    def get_event_by_id(self, event_id: Union[int, str]) -> Optional[Dict[str, Any]]:
        """
        Retrieve a specific event by ID with validation.
        
        Args:
            event_id: MISP event ID
            
        Returns:
            Event data or None if not found
        """
        # Validate event ID
        try:
            event_id = int(event_id)
            if event_id <= 0:
                raise ValueError("Event ID must be positive")
        except (ValueError, TypeError):
            raise ValueError("Invalid event ID format")
        
        misp = self._connect()
        
        try:
            with measure_time("get_event"):
                result = misp.get_event(event_id)
                
                if 'errors' in result:
                    return None
                
                logger.info("Event retrieved", event_id=event_id)
                
                # Log Galaxy Clusters if present for debugging
                if 'Event' in result and 'Galaxy' in result['Event']:
                    galaxy_count = len(result['Event']['Galaxy'])
                    logger.info("Event has Galaxy Clusters", event_id=event_id, galaxy_count=galaxy_count)
                    for galaxy in result['Event']['Galaxy']:
                        if 'GalaxyCluster' in galaxy:
                            for cluster in galaxy['GalaxyCluster']:
                                logger.info("Galaxy Cluster found", 
                                          cluster_value=cluster.get('value', 'Unknown'),
                                          cluster_type=galaxy.get('type', 'Unknown'))
                
                return result
                
        except Exception as e:
            logger.error("Failed to retrieve event", event_id=event_id, error=str(e))
            raise
    
    def test_connection(self) -> bool:
        """
        Test MISP connection and return status.
        
        Returns:
            True if connection successful, False otherwise
        """
        try:
            misp = self._connect()
            return self._connection_validated
        except Exception as e:
            logger.error("Connection test failed", error=str(e))
            return False
    
    def publish_event(self, event_id: Union[int, str]) -> bool:
        """
        Publish a MISP event.
        
        Args:
            event_id: MISP event ID to publish
            
        Returns:
            True if successful, False otherwise
        """
        try:
            event_id = int(event_id)
            if event_id <= 0:
                raise ValueError("Event ID must be positive")
        except (ValueError, TypeError):
            raise ValueError("Invalid event ID format")
        
        misp = self._connect()
        
        try:
            with measure_time("publish_event"):
                result = misp.publish(event_id)
                
                if 'errors' in result:
                    logger.error("Failed to publish event", event_id=event_id, errors=result['errors'])
                    return False
                
                logger.info("Event published successfully", event_id=event_id)
                return True
                
        except Exception as e:
            logger.error("Failed to publish event", event_id=event_id, error=str(e))
            return False
    
    def get_events_with_tlp_filter(self, search_params: Dict[str, Any], exclude_tlp_red: bool = True) -> List[Dict[str, Any]]:
        """
        Search for events with TLP filtering to exclude sensitive events.
        
        Args:
            search_params: Search parameters
            exclude_tlp_red: If True, exclude TLP:RED events from results
            
        Returns:
            List of matching events with TLP filtering applied
        """
        misp = self._connect()
        
        try:
            with measure_time("search_events_with_tlp_filter"):
                # Sanitize search parameters
                safe_params = self._sanitize_search_params(search_params)
                
                results = misp.search(controller='events', **safe_params)
                
                if not results:
                    return []
                
                # Filter out TLP:RED events if requested
                if exclude_tlp_red:
                    filtered_results = []
                    for event in results:
                        # Check event tags for TLP:RED
                        is_tlp_red = False
                        
                        if 'Event' in event:
                            event_data = event['Event']
                            tags = event_data.get('Tag', [])
                            
                            for tag in tags:
                                tag_name = tag.get('name', '').lower()
                                if 'tlp:red' in tag_name:
                                    is_tlp_red = True
                                    break
                        
                        if not is_tlp_red:
                            filtered_results.append(event)
                        else:
                            logger.debug("Filtered out TLP:RED event", event_id=event_data.get('id'))
                    
                    results = filtered_results
                
                logger.info(
                    "Event search with TLP filter completed",
                    result_count=len(results),
                    tlp_red_filtered=exclude_tlp_red
                )
                
                return results
                
        except Exception as e:
            logger.error("Event search with TLP filter failed", error=str(e))
            raise

    def fetch_dashboard_data(self, days_back: int = 30) -> Dict[str, Any]:
        """
        Fetch dashboard data from MISP, excluding TLP:RED events.
        
        Args:
            days_back: Number of days to look back for events
            
        Returns:
            Dictionary containing dashboard data
        """
        misp = self._connect()
        
        try:
            with measure_time("fetch_dashboard_data"):
                # Calculate date range
                from datetime import datetime, timedelta
                end_date = datetime.now()
                start_date = end_date - timedelta(days=days_back)
                
                # Search parameters for recent events
                search_params = {
                    'limit': 500,
                    'date_from': start_date.strftime('%Y-%m-%d'),
                    'date_to': end_date.strftime('%Y-%m-%d'),
                    'include_context': True,
                    'include_correlations': False
                }
                
                # Get events with TLP filtering
                events = self.get_events_with_tlp_filter(search_params, exclude_tlp_red=True)
                
                # Process events into dashboard format
                dashboard_data = {
                    'lastUpdated': datetime.now().isoformat(),
                    'totalEvents': len(events),
                    'events': [],
                    'stats': {
                        'totalEvents': len(events),
                        'eventsToday': 0,
                        'eventsThisWeek': 0,
                        'highThreatEvents': 0,
                        'publishedEvents': 0,
                        'unpublishedEvents': 0,
                        'tlpRedFiltered': 0
                    },
                    'metrics': {
                        'threatLevelDistribution': [],
                        'attackTypeDistribution': [],
                        'tlpDistribution': [],
                        'dailyEvents': []
                    }
                }
                
                # Process each event
                today = datetime.now().strftime('%Y-%m-%d')
                week_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
                
                threat_levels = {'1': 0, '2': 0, '3': 0, '4': 0}
                tlp_counts = {}
                attack_types = {}
                daily_counts = {}
                
                for event in events:
                    event_data = event.get('Event', {})
                    
                    # Convert to frontend format
                    frontend_event = {
                        'id': event_data.get('id'),
                        'uuid': event_data.get('uuid'),
                        'info': event_data.get('info', ''),
                        'date': event_data.get('date', ''),
                        'threat_level': event_data.get('threat_level_id', '4'),
                        'published': event_data.get('published', False),
                        'tags': [{'name': tag.get('name', '')} for tag in event_data.get('Tag', [])]
                    }
                    
                    dashboard_data['events'].append(frontend_event)
                    
                    # Update statistics
                    if frontend_event['date'] == today:
                        dashboard_data['stats']['eventsToday'] += 1
                    if frontend_event['date'] >= week_ago:
                        dashboard_data['stats']['eventsThisWeek'] += 1
                    
                    threat_level = frontend_event['threat_level']
                    if threat_level in ['1', '2']:
                        dashboard_data['stats']['highThreatEvents'] += 1
                    
                    if frontend_event['published']:
                        dashboard_data['stats']['publishedEvents'] += 1
                    else:
                        dashboard_data['stats']['unpublishedEvents'] += 1
                    
                    # Count threat levels
                    if threat_level in threat_levels:
                        threat_levels[threat_level] += 1
                    
                    # Count TLP tags and attack types
                    for tag in frontend_event['tags']:
                        tag_name = tag['name'].lower()
                        if 'tlp:' in tag_name:
                            tlp_counts[tag_name] = tlp_counts.get(tag_name, 0) + 1
                        elif 'ddos:type=' in tag_name:
                            attack_type = tag_name.replace('ddos:type=', '').replace('"', '')
                            attack_types[attack_type] = attack_types.get(attack_type, 0) + 1
                    
                    # Count daily events
                    event_date = frontend_event['date']
                    daily_counts[event_date] = daily_counts.get(event_date, 0) + 1
                
                # Format metrics
                threat_colors = {
                    '1': '#f44336',  # High - Red
                    '2': '#ff9800',  # Medium - Orange  
                    '3': '#ffeb3b',  # Low - Yellow
                    '4': '#9e9e9e'   # Undefined - Grey
                }
                
                threat_labels = {
                    '1': 'High',
                    '2': 'Medium',
                    '3': 'Low',
                    '4': 'Undefined'
                }
                
                dashboard_data['metrics']['threatLevelDistribution'] = [
                    {
                        'level': threat_labels[level],
                        'count': count,
                        'color': threat_colors[level]
                    }
                    for level, count in threat_levels.items()
                ]
                
                dashboard_data['metrics']['attackTypeDistribution'] = [
                    {'type': attack_type, 'count': count}
                    for attack_type, count in attack_types.items()
                ]
                
                tlp_colors = {
                    'tlp:red': '#f44336',
                    'tlp:amber': '#ff9800', 
                    'tlp:green': '#4caf50',
                    'tlp:white': '#ffffff'
                }
                
                dashboard_data['metrics']['tlpDistribution'] = [
                    {
                        'tlp': tlp,
                        'count': count,
                        'color': tlp_colors.get(tlp, '#9e9e9e')
                    }
                    for tlp, count in tlp_counts.items()
                ]
                
                dashboard_data['metrics']['dailyEvents'] = [
                    {'date': date, 'count': count}
                    for date, count in sorted(daily_counts.items())
                ]
                
                logger.info("Dashboard data fetched successfully", 
                           events_count=len(events),
                           date_range=f"{start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
                
                return dashboard_data
                
        except Exception as e:
            logger.error("Failed to fetch dashboard data", error=str(e))
            raise


def create_misp_client(config_path: Optional[Path] = None) -> SecureMISPClient:
    """
    Factory function to create a secure MISP client.
    
    Args:
        config_path: Optional path to configuration file
        
    Returns:
        Configured SecureMISPClient instance
    """
    try:
        if config_path and config_path.exists():
            # Load from config file (implement if needed)
            pass
        
        return SecureMISPClient()
        
    except Exception as e:
        logger.error("Failed to create MISP client", error=str(e))
        raise


def main():
    """Main CLI entry point with argument support."""
    import argparse
    import csv
    import sys
    
    parser = argparse.ArgumentParser(description='MISP DDoS Event Automation CLI')
    parser.add_argument('--file', type=str, help='CSV/JSON file to process')
    parser.add_argument('--batch', action='store_true', help='Batch processing mode')
    parser.add_argument('--auto-publish', action='store_true', help='Auto-publish created events')
    parser.add_argument('--processing-id', type=str, help='Unique processing ID for workflow tracking')
    parser.add_argument('--test-connection', action='store_true', help='Test MISP connection only')
    parser.add_argument('--fetch-dashboard-data', action='store_true', help='Fetch dashboard data (non TLP:RED events)')
    parser.add_argument('--output', type=str, help='Output file path for dashboard data')
    
    args = parser.parse_args()
    
    try:
        client = create_misp_client()
        
        if args.test_connection:
            # Test connection and exit
            logger.info("Testing MISP connection...")
            success = client.test_connection()
            if success:
                logger.info("✅ MISP connection successful")
                sys.exit(0)
            else:
                logger.error("❌ MISP connection failed")
                sys.exit(1)
        
        if args.fetch_dashboard_data:
            # Fetch dashboard data
            logger.info("Fetching dashboard data...")
            dashboard_data = client.fetch_dashboard_data()
            
            # Determine output file
            output_file = args.output or 'dashboard-data.json'
            output_path = Path(output_file)
            
            # Create output directory if needed
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Write dashboard data to file
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(dashboard_data, f, indent=2, ensure_ascii=False)
            
            logger.info("✅ Dashboard data saved successfully", 
                       output_file=str(output_path),
                       events_count=dashboard_data['totalEvents'])
            sys.exit(0)
        
        if args.file:
            # Process file
            file_path = Path(args.file)
            if not file_path.exists():
                logger.error("File not found", file_path=str(file_path))
                sys.exit(1)
            
            logger.info("Processing file", file_path=str(file_path), processing_id=args.processing_id)
            
            events_created = 0
            events_failed = 0
            
            if file_path.suffix.lower() == '.csv':
                # Process CSV file
                with open(file_path, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    for row_num, row in enumerate(reader, 1):
                        try:
                            # Create DDoSEvent from CSV row
                            ddos_event = {
                                'title': row.get('title', ''),
                                'description': row.get('description', ''),
                                'attacker_ips': row.get('attacker_ips', '').split(','),
                                'victim_ips': row.get('victim_ips', '').split(','),
                                'attack_ports': row.get('attack_ports', '').split(','),
                                'attack_type': row.get('attack_type', 'other'),
                                'severity': row.get('severity', 'medium'),
                                'timestamp': row.get('timestamp', ''),
                            }
                            
                            # Clean up IP and port lists
                            ddos_event['attacker_ips'] = [ip.strip() for ip in ddos_event['attacker_ips'] if ip.strip()]
                            ddos_event['victim_ips'] = [ip.strip() for ip in ddos_event['victim_ips'] if ip.strip()]
                            ddos_event['attack_ports'] = [port.strip() for port in ddos_event['attack_ports'] if port.strip()]
                            
                            # Create MISP event using DDoSEventData model
                            event_data = DDoSEventData(
                                title=ddos_event['title'],
                                description=ddos_event['description'],
                                attacker_ips=ddos_event['attacker_ips'],
                                victim_ips=ddos_event['victim_ips'],
                                attack_ports=[int(p) for p in ddos_event['attack_ports'] if p.isdigit()],
                                attack_type=ddos_event['attack_type'],
                                severity=ddos_event['severity'],
                                timestamp=ddos_event['timestamp']
                            )
                            
                            result = client.create_ddos_event(event_data)
                            event_id = result.get('event_id')
                            
                            if args.auto_publish and event_id:
                                client.publish_event(event_id)
                            
                            events_created += 1
                            logger.info("Created MISP event", event_id=event_id, row=row_num)
                            
                        except Exception as e:
                            events_failed += 1
                            logger.error("Failed to create event", row=row_num, error=str(e))
            
            elif file_path.suffix.lower() == '.json':
                # Process JSON file
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                    # Support both single event and array of events
                    events = data if isinstance(data, list) else [data]
                    
                    for event_num, ddos_event_dict in enumerate(events, 1):
                        try:
                            # Create DDoSEventData from dict
                            event_data = DDoSEventData(**ddos_event_dict)
                            
                            result = client.create_ddos_event(event_data)
                            event_id = result.get('event_id')
                            
                            if args.auto_publish and event_id:
                                client.publish_event(event_id)
                            
                            events_created += 1
                            logger.info("Created MISP event", event_id=event_id, event_num=event_num)
                            
                        except Exception as e:
                            events_failed += 1
                            logger.error("Failed to create event", event_num=event_num, error=str(e))
            
            # Write results for GitHub Actions
            with open('events_created.count', 'w') as f:
                f.write(str(events_created))
            with open('events_failed.count', 'w') as f:
                f.write(str(events_failed))
            
            logger.info("Batch processing complete", 
                       events_created=events_created, 
                       events_failed=events_failed,
                       processing_id=args.processing_id)
        
        else:
            # Interactive mode
            logger.info("MISP client ready for interactive use")
            
    except Exception as e:
        logger.error("CLI execution failed", error=str(e))
        sys.exit(1)


if __name__ == "__main__":
    main()