"""
MISP DDoS Event Client
Handles all interactions with MISP instance
"""

from pymisp import PyMISP, MISPEvent, MISPObject
from typing import Dict, List

class MISPDDoSClient:
    """Main client for MISP DDoS events"""
    
    # Playbook mandatory tags
    MANDATORY_TAGS = [
        'tlp:green',
        'information-security-indicators:incident-type="ddos"',
        'misp-event-type:incident'
    ]
    
    def __init__(self, url: str, api_key: str):
        """Initialize MISP connection"""
        self.misp = PyMISP(url, api_key, ssl=True)
        print(f"Connected to MISP at {url}")
    
    def create_event(self, title: str, description: str) -> MISPEvent:
        """Create a basic DDoS event"""
        event = MISPEvent()
        event.info = title
        
        # Add mandatory tags
        for tag in self.MANDATORY_TAGS:
            event.add_tag(tag)
        
        print(f"Created event: {title}")
        return event

if __name__ == "__main__":
    print("MISP DDoS Client ready!")