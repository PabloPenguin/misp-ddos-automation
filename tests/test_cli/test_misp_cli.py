"""
Comprehensive test suite for MISP CLI
Tests security, functionality, and edge cases per requirements.
"""

import pytest
import tempfile
import json
import csv
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
from pydantic import ValidationError

import sys
sys.path.append(str(Path(__file__).parent.parent / 'src'))

from misp_client import SecureMISPClient, DDoSEventData, SecurityError, MISPConfig
from cli import validate_file_path, parse_csv_file, parse_json_file, CLIError


class TestMISPConfig:
    """Test MISP configuration validation."""
    
    def test_valid_config(self):
        """Test valid configuration creation."""
        config = MISPConfig(
            misp_url="https://server1.tailaa85d9.ts.net",
            api_key="a" * 40
        )
        assert config.misp_url == "https://server1.tailaa85d9.ts.net"
        assert config.verify_ssl is True
        assert config.timeout == 30
    
    def test_invalid_url_format(self):
        """Test invalid URL format validation."""
        with pytest.raises(ValueError, match="Invalid URL format"):
            MISPConfig(misp_url="not-a-url", api_key="a" * 40)
    
    def test_invalid_protocol(self):
        """Test invalid protocol rejection."""
        with pytest.raises(ValueError, match="HTTP or HTTPS protocol"):
            MISPConfig(misp_url="ftp://example.com", api_key="a" * 40)
    
    def test_short_api_key(self):
        """Test API key length validation."""
        with pytest.raises(ValueError, match="API key appears too short"):
            MISPConfig(misp_url="https://example.com", api_key="short")
    
    def test_http_warning(self, caplog):
        """Test HTTP usage warning."""
        config = MISPConfig(misp_url="http://example.com", api_key="a" * 40)
        assert "Using HTTP connection" in caplog.text


class TestDDoSEventData:
    """Test DDoS event data validation."""
    
    def test_valid_event_data(self):
        """Test valid event data creation."""
        data = DDoSEventData(
            title="Test Attack",
            description="Test description",
            attacker_ips=["192.0.2.1", "192.0.2.2"],
            victim_ips=["203.0.113.1"]
        )
        assert data.title == "Test Attack"
        assert len(data.attacker_ips) == 2
        assert data.attack_type == "direct-flood"
    
    def test_invalid_ip_addresses(self):
        """Test invalid IP address rejection."""
        with pytest.raises(ValueError, match="At least one valid IP address required"):
            DDoSEventData(
                title="Test",
                description="Test",
                attacker_ips=["invalid-ip"],
                victim_ips=["also-invalid"]
            )
    
    def test_mixed_valid_invalid_ips(self):
        """Test handling of mixed valid/invalid IP addresses."""
        data = DDoSEventData(
            title="Test",
            description="Test",
            attacker_ips=["192.0.2.1", "invalid-ip", "192.0.2.2"],
            victim_ips=["203.0.113.1", "bad-ip"]
        )
        assert len(data.attacker_ips) == 2
        assert len(data.victim_ips) == 1
    
    def test_ipv6_addresses(self):
        """Test IPv6 address support."""
        data = DDoSEventData(
            title="Test",
            description="Test",
            attacker_ips=["2001:db8::1"],
            victim_ips=["2001:db8::2"]
        )
        assert "2001:db8::1" in data.attacker_ips
    
    def test_invalid_ports(self):
        """Test port validation."""
        data = DDoSEventData(
            title="Test",
            description="Test",
            attacker_ips=["192.0.2.1"],
            victim_ips=["203.0.113.1"],
            attack_ports=[80, 99999, -1, 443]  # Mix of valid and invalid
        )
        assert data.attack_ports == [80, 443]


class TestFileValidation:
    """Test file path validation and security."""
    
    def test_valid_file(self):
        """Test valid file validation."""
        with tempfile.NamedTemporaryFile(suffix='.csv', delete=False) as f:
            f.write(b"test data")
            temp_path = Path(f.name)
        
        try:
            result = validate_file_path(str(temp_path), ['.csv'])
            assert result == temp_path.resolve()
        finally:
            temp_path.unlink()
    
    def test_nonexistent_file(self):
        """Test nonexistent file rejection."""
        with pytest.raises(CLIError, match="File does not exist"):
            validate_file_path("/nonexistent/file.csv")
    
    def test_directory_instead_of_file(self):
        """Test directory rejection."""
        with tempfile.TemporaryDirectory() as temp_dir:
            with pytest.raises(CLIError, match="Path is not a file"):
                validate_file_path(temp_dir)
    
    def test_invalid_extension(self):
        """Test file extension validation."""
        with tempfile.NamedTemporaryFile(suffix='.txt', delete=False) as f:
            temp_path = Path(f.name)
        
        try:
            with pytest.raises(CLIError, match="File extension not allowed"):
                validate_file_path(str(temp_path), ['.csv'])
        finally:
            temp_path.unlink()
    
    def test_file_too_large(self):
        """Test file size limit."""
        with tempfile.NamedTemporaryFile(suffix='.csv', delete=False) as f:
            # Create a file larger than 100MB
            large_data = b"x" * (101 * 1024 * 1024)
            f.write(large_data)
            temp_path = Path(f.name)
        
        try:
            with pytest.raises(CLIError, match="File too large"):
                validate_file_path(str(temp_path))
        finally:
            temp_path.unlink()
    
    def test_path_traversal_prevention(self):
        """Test path traversal attack prevention."""
        # This test ensures path canonicalization works
        with tempfile.NamedTemporaryFile(suffix='.csv', delete=False) as f:
            temp_path = Path(f.name)
        
        try:
            # Try path with traversal elements
            traversal_path = str(temp_path.parent / ".." / temp_path.name)
            result = validate_file_path(traversal_path, ['.csv'])
            assert ".." not in str(result)
        finally:
            temp_path.unlink()


class TestCSVParsing:
    """Test CSV file parsing security and functionality."""
    
    def test_valid_csv_parsing(self):
        """Test parsing valid CSV file."""
        csv_data = """title,description,attacker_ips,victim_ips,attack_ports,attack_type,severity
"Test Attack","Test description","192.0.2.1,192.0.2.2","203.0.113.1","80,443","direct-flood","high"
"Another Attack","Another desc","192.0.2.3","203.0.113.2","8080","amplification","medium"
"""
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            f.write(csv_data)
            temp_path = Path(f.name)
        
        try:
            events = parse_csv_file(temp_path)
            assert len(events) == 2
            assert events[0]['title'] == "Test Attack"
            assert len(events[0]['attacker_ips']) == 2
            assert events[0]['attack_ports'] == [80, 443]
        finally:
            temp_path.unlink()
    
    def test_missing_required_columns(self):
        """Test CSV with missing required columns."""
        csv_data = "title,description\n\"Test\",\"Test desc\""
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            f.write(csv_data)
            temp_path = Path(f.name)
        
        try:
            with pytest.raises(CLIError, match="Missing required CSV columns"):
                parse_csv_file(temp_path)
        finally:
            temp_path.unlink()
    
    def test_malformed_csv(self):
        """Test malformed CSV handling."""
        csv_data = "title,description,attacker_ips,victim_ips\n\"Unclosed quote,desc,ip,ip"
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            f.write(csv_data)
            temp_path = Path(f.name)
        
        try:
            # Should handle gracefully and return empty list or skip bad rows
            events = parse_csv_file(temp_path)
            # Test behavior - might be empty due to malformed data
            assert isinstance(events, list)
        finally:
            temp_path.unlink()
    
    def test_csv_injection_prevention(self):
        """Test CSV injection attack prevention."""
        # CSV with potentially dangerous formulas
        csv_data = """title,description,attacker_ips,victim_ips
"=SUM(1+1)","=EXEC('calc')","192.0.2.1","203.0.113.1"
"""
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            f.write(csv_data)
            temp_path = Path(f.name)
        
        try:
            events = parse_csv_file(temp_path)
            # Ensure formulas are treated as strings, not executed
            assert events[0]['title'] == "=SUM(1+1)"
            assert events[0]['description'] == "=EXEC('calc')"
        finally:
            temp_path.unlink()
    
    def test_large_csv_limit(self):
        """Test CSV row limit enforcement."""
        # Create CSV with many rows
        csv_data = "title,description,attacker_ips,victim_ips\n"
        for i in range(1005):  # More than 1000 limit
            csv_data += f"\"Attack {i}\",\"Desc {i}\",\"192.0.2.{i % 255}\",\"203.0.113.1\"\n"
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            f.write(csv_data)
            temp_path = Path(f.name)
        
        try:
            events = parse_csv_file(temp_path)
            # Should be limited to 1000 events
            assert len(events) == 1000
        finally:
            temp_path.unlink()


class TestJSONParsing:
    """Test JSON file parsing security and functionality."""
    
    def test_valid_json_parsing(self):
        """Test parsing valid JSON file."""
        json_data = {
            "events": [
                {
                    "title": "Test Attack",
                    "description": "Test description",
                    "attacker_ips": ["192.0.2.1"],
                    "victim_ips": ["203.0.113.1"],
                    "attack_ports": [80, 443],
                    "attack_type": "direct-flood"
                }
            ]
        }
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(json_data, f)
            temp_path = Path(f.name)
        
        try:
            events = parse_json_file(temp_path)
            assert len(events) == 1
            assert events[0]['title'] == "Test Attack"
        finally:
            temp_path.unlink()
    
    def test_json_as_array(self):
        """Test JSON file with array at root level."""
        json_data = [
            {
                "title": "Test Attack",
                "description": "Test description",
                "attacker_ips": ["192.0.2.1"],
                "victim_ips": ["203.0.113.1"]
            }
        ]
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(json_data, f)
            temp_path = Path(f.name)
        
        try:
            events = parse_json_file(temp_path)
            assert len(events) == 1
        finally:
            temp_path.unlink()
    
    def test_invalid_json_format(self):
        """Test invalid JSON format handling."""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            f.write("{ invalid json }")
            temp_path = Path(f.name)
        
        try:
            with pytest.raises(CLIError, match="Invalid JSON format"):
                parse_json_file(temp_path)
        finally:
            temp_path.unlink()
    
    def test_json_bomb_prevention(self):
        """Test JSON bomb attack prevention."""
        # Create deeply nested JSON that could cause stack overflow
        nested_dict = {}
        current = nested_dict
        for i in range(100):  # Not extremely deep to avoid test timeout
            current['nested'] = {}
            current = current['nested']
        
        json_data = {"events": [nested_dict]}
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(json_data, f)
            temp_path = Path(f.name)
        
        try:
            # Should handle without crashing
            events = parse_json_file(temp_path)
            assert isinstance(events, list)
        finally:
            temp_path.unlink()


class TestSecureMISPClient:
    """Test MISP client security and functionality."""
    
    @patch.dict('os.environ', {
        'MISP_URL': 'https://server1.tailaa85d9.ts.net',
        'MISP_API_KEY': 'a' * 40
    })
    def test_client_initialization(self):
        """Test client initialization from environment."""
        client = SecureMISPClient()
        assert client.config.misp_url == 'https://server1.tailaa85d9.ts.net'
        assert not client._connection_validated
    
    def test_missing_environment_variables(self):
        """Test error when environment variables missing."""
        with patch.dict('os.environ', {}, clear=True):
            with pytest.raises(ValueError, match="MISP_URL environment variable required"):
                SecureMISPClient()
    
    @patch('misp_client.PyMISP')
    def test_connection_validation(self, mock_pymisp):
        """Test MISP connection validation."""
        # Mock PyMISP instance
        mock_instance = MagicMock()
        mock_instance.get_version.return_value = {'version': '2.4.175'}
        mock_pymisp.return_value = mock_instance
        
        config = MISPConfig(
            misp_url="https://test.com",
            api_key="a" * 40
        )
        client = SecureMISPClient(config)
        
        # Test connection
        result = client._connect()
        assert client._connection_validated
        mock_pymisp.assert_called_once()
    
    @patch('misp_client.PyMISP')
    def test_connection_failure(self, mock_pymisp):
        """Test connection failure handling."""
        mock_pymisp.side_effect = Exception("Connection failed")
        
        config = MISPConfig(
            misp_url="https://test.com",
            api_key="a" * 40
        )
        client = SecureMISPClient(config)
        
        with pytest.raises(SecurityError, match="Unexpected connection error"):
            client._connect()
    
    @patch('misp_client.PyMISP')
    def test_create_ddos_event(self, mock_pymisp):
        """Test DDoS event creation."""
        # Mock PyMISP instance
        mock_instance = MagicMock()
        mock_instance.get_version.return_value = {'version': '2.4.175'}
        mock_instance.add_event.return_value = {
            'Event': {'id': '123'}
        }
        mock_pymisp.return_value = mock_instance
        
        config = MISPConfig(
            misp_url="https://test.com",
            api_key="a" * 40
        )
        client = SecureMISPClient(config)
        
        event_data = DDoSEventData(
            title="Test Attack",
            description="Test description",
            attacker_ips=["192.0.2.1"],
            victim_ips=["203.0.113.1"]
        )
        
        result = client.create_ddos_event(event_data)
        
        assert result['success'] is True
        assert result['event_id'] == '123'
        mock_instance.add_event.assert_called_once()
    
    def test_search_parameter_sanitization(self):
        """Test search parameter sanitization."""
        config = MISPConfig(
            misp_url="https://test.com",
            api_key="a" * 40
        )
        client = SecureMISPClient(config)
        
        # Test malicious parameters
        unsafe_params = {
            'eventinfo': 'test',
            'malicious_param': 'rm -rf /',
            'tags': ['tag1', 'tag2'],
            'dangerous_script': '<script>alert("xss")</script>'
        }
        
        safe_params = client._sanitize_search_params(unsafe_params)
        
        assert 'eventinfo' in safe_params
        assert 'tags' in safe_params
        assert 'malicious_param' not in safe_params
        assert 'dangerous_script' not in safe_params
    
    def test_event_id_validation(self):
        """Test event ID validation."""
        config = MISPConfig(
            misp_url="https://test.com",
            api_key="a" * 40
        )
        client = SecureMISPClient(config)
        
        # Test invalid event IDs
        with pytest.raises(ValueError, match="Invalid event ID format"):
            client.get_event_by_id("not_a_number")
        
        with pytest.raises(ValueError, match="Event ID must be positive"):
            client.get_event_by_id(-1)
        
        with pytest.raises(ValueError, match="Event ID must be positive"):
            client.get_event_by_id(0)


class TestSecurityValidation:
    """Test security-specific validation and protection."""
    
    def test_attribute_validation(self):
        """Test custom attribute validation."""
        config = MISPConfig(
            misp_url="https://test.com",
            api_key="a" * 40
        )
        client = SecureMISPClient(config)
        
        # Test valid attributes
        assert client._validate_attribute("test_attr", "test_value") is True
        
        # Test attribute name too long
        assert client._validate_attribute("a" * 101, "value") is False
        
        # Test attribute value too long
        assert client._validate_attribute("name", "a" * 1001) is False
        
        # Test non-string attribute name
        assert client._validate_attribute(123, "value") is False
    
    def test_ip_validation_edge_cases(self):
        """Test IP validation with edge cases."""
        # Test private IP ranges
        data = DDoSEventData(
            title="Test",
            description="Test",
            attacker_ips=["10.0.0.1", "172.16.0.1", "192.168.1.1"],
            victim_ips=["127.0.0.1"]  # localhost
        )
        
        # Should accept private IPs (may be internal attack)
        assert "10.0.0.1" in data.attacker_ips
        assert "127.0.0.1" in data.victim_ips
        
        # Test multicast and broadcast addresses
        data2 = DDoSEventData(
            title="Test",
            description="Test",
            attacker_ips=["224.0.0.1"],  # Multicast
            victim_ips=["255.255.255.255"]  # Broadcast
        )
        
        # Should handle special addresses appropriately
        assert isinstance(data2.attacker_ips, list)
        assert isinstance(data2.victim_ips, list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])