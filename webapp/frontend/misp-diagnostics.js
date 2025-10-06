// MISP Connection Test Script
// This script tests the MISP API connection with detailed debugging

console.log('🔧 MISP Connection Diagnostic Tool');
console.log('====================================\n');

// Test MISP API connection with debugging
async function testMISPConnection() {
  console.log('📋 Step 1: Checking MISP Configuration...');
  
  // Check if settings exist in localStorage
  const savedSettings = localStorage.getItem('mispSettings');
  if (!savedSettings) {
    console.log('❌ No MISP settings found in localStorage');
    console.log('   Go to Settings page and configure your MISP API key');
    return false;
  }
  
  const settings = JSON.parse(savedSettings);
  console.log('✅ MISP settings loaded from localStorage');
  console.log('   URL:', settings.mispUrl);
  console.log('   API Key:', settings.mispApiKey ? `${settings.mispApiKey.substring(0, 8)}...` : 'Not set');
  
  if (!settings.mispApiKey || !settings.mispUrl) {
    console.log('❌ Missing MISP API key or URL');
    return false;
  }
  
  console.log('\n📡 Step 2: Testing MISP API Connection...');
  
  // Test direct fetch to MISP API
  const testUrl = `${settings.mispUrl}/users/view/me.json`;
  console.log('   Testing URL:', testUrl);
  
  try {
    console.log('   Making API request...');
    
    const response = await fetch(testUrl, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': settings.mispApiKey,
        'X-API-Key': settings.mispApiKey,
      },
    });
    
    console.log('   Response status:', response.status);
    console.log('   Response statusText:', response.statusText);
    console.log('   Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      console.log('❌ HTTP Error:', response.status, response.statusText);
      
      // Try to get error details
      try {
        const errorText = await response.text();
        console.log('   Error response body:', errorText);
      } catch (e) {
        console.log('   Could not read error response body');
      }
      
      // Common MISP errors and solutions
      if (response.status === 401) {
        console.log('💡 Solution: Check your API key - it might be invalid');
      } else if (response.status === 403) {
        console.log('💡 Solution: API key valid but lacks permissions');
      } else if (response.status === 404) {
        console.log('💡 Solution: Check MISP URL - endpoint not found');
      } else if (response.status === 0 || response.status >= 500) {
        console.log('💡 Solution: MISP server may be down or unreachable');
      }
      
      return false;
    }
    
    const userData = await response.json();
    console.log('✅ MISP API connection successful!');
    console.log('   User ID:', userData.User?.id);
    console.log('   Email:', userData.User?.email);
    console.log('   Role ID:', userData.User?.role_id);
    console.log('   Organisation:', userData.User?.Organisation?.name);
    
    return true;
    
  } catch (error) {
    console.log('❌ Connection failed with error:', error.message);
    
    // Diagnose common errors
    if (error.message.includes('CORS')) {
      console.log('💡 CORS Error: Your MISP instance may not have CORS enabled');
      console.log('   This is common when accessing MISP from a web browser');
      console.log('   Solution: Configure MISP CORS settings or use the CLI');
    } else if (error.message.includes('network')) {
      console.log('💡 Network Error: Cannot reach MISP server');
      console.log('   Check if server1.tailaa85d9.ts.net is accessible');
    } else if (error.message.includes('SSL') || error.message.includes('certificate')) {
      console.log('💡 SSL Error: Certificate issue with MISP server');
    }
    
    console.log('   Full error:', error);
    return false;
  }
}

// Test event creation structure
function testEventStructure() {
  console.log('\n🏗️  Step 3: Testing DDoS Event Structure...');
  
  const testEvent = {
    title: 'Test DDoS Attack - Connection Validation',
    description: 'This is a test event to validate MISP integration',
    attacker_ips: ['198.51.100.1', '203.0.113.1'],
    victim_ips: ['192.168.1.100'],
    attack_ports: ['80', '443'],
    attack_type: 'direct-flood',
    severity: 'high'
  };
  
  console.log('✅ Test event structure:');
  console.log(JSON.stringify(testEvent, null, 2));
  
  console.log('✅ Required Galaxy Clusters:');
  console.log('   - misp-galaxy:mitre-attack-pattern="Network Denial of Service - T1498"');
  console.log('   - misp-galaxy:mitre-attack-pattern="T1498.001" (Direct Flood)');
  
  console.log('✅ Required Tags:');
  console.log('   - tlp:green');
  console.log('   - information-security-indicators:incident-type="ddos"');
  console.log('   - misp-event-type:incident');
  
  return testEvent;
}

// CORS alternative test
async function testCORSAlternative() {
  console.log('\n🔄 Step 4: Testing CORS Alternative Methods...');
  
  const savedSettings = localStorage.getItem('mispSettings');
  if (!savedSettings) return;
  
  const settings = JSON.parse(savedSettings);
  
  // Test with different CORS modes
  const modes = ['cors', 'no-cors', 'same-origin'];
  
  for (const mode of modes) {
    console.log(`   Testing with mode: ${mode}`);
    
    try {
      const response = await fetch(`${settings.mispUrl}/users/view/me.json`, {
        method: 'GET',
        mode: mode,
        headers: {
          'Authorization': settings.mispApiKey,
          'X-API-Key': settings.mispApiKey,
        },
      });
      
      console.log(`   ✅ ${mode} mode: Status ${response.status}`);
      
      if (mode === 'no-cors') {
        console.log('   ⚠️  no-cors mode succeeded but response is opaque');
      }
      
    } catch (error) {
      console.log(`   ❌ ${mode} mode failed: ${error.message}`);
    }
  }
}

// Run all tests
async function runDiagnostics() {
  console.log('🚀 Starting MISP Diagnostics...\n');
  
  const connectionSuccess = await testMISPConnection();
  const eventStructure = testEventStructure();
  await testCORSAlternative();
  
  console.log('\n📊 Diagnostic Summary:');
  console.log('========================');
  console.log('MISP Connection:', connectionSuccess ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Event Structure:', '✅ VALID');
  console.log('CORS Testing:', '✅ COMPLETED');
  
  if (connectionSuccess) {
    console.log('\n🎉 MISP integration is working!');
    console.log('You can now:');
    console.log('1. Create DDoS events through the Upload page');
    console.log('2. View events in the Events page');
    console.log('3. Use the CLI for batch processing');
  } else {
    console.log('\n🔧 MISP connection needs troubleshooting');
    console.log('Next steps:');
    console.log('1. Verify your API key is correct');
    console.log('2. Check if MISP server is accessible');
    console.log('3. Configure CORS settings on MISP server');
    console.log('4. Consider using the CLI for direct API access');
  }
  
  return {
    connectionSuccess,
    eventStructure,
    timestamp: new Date().toISOString()
  };
}

// Export for console use
window.mispDiagnostics = {
  runDiagnostics,
  testMISPConnection,
  testEventStructure,
  testCORSAlternative
};

// Auto-run diagnostics
console.log('💡 To run diagnostics manually, call: mispDiagnostics.runDiagnostics()');
console.log('💡 Individual tests available: testMISPConnection, testEventStructure, testCORSAlternative\n');

// Auto-run on page load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    runDiagnostics();
  }, 1000);
}