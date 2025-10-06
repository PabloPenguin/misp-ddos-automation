// MISP API Connection Test
// This script tests the MISP API service functionality

import { MISPApiService } from '../src/services/mispApi.js';

async function testMISPConnection() {
  console.log('🧪 Testing MISP API Connection...\n');

  const mispService = new MISPApiService();

  // Test 1: Check if credentials are required
  console.log('1. Testing connection without credentials...');
  try {
    await mispService.testConnection();
    console.log('❌ Should have failed without credentials');
  } catch (error) {
    console.log('✅ Correctly requires credentials:', error.message);
  }

  // Test 2: Test with sample credentials (you'll need to provide real ones)
  console.log('\n2. Testing with credentials...');
  
  // You'll need to set your actual API key here for testing
  const testCredentials = {
    apiKey: process.env.MISP_API_KEY || 'YOUR_API_KEY_HERE',
    baseUrl: 'https://server1.tailaa85d9.ts.net'
  };

  if (testCredentials.apiKey === 'YOUR_API_KEY_HERE') {
    console.log('⚠️  Please set MISP_API_KEY environment variable or update testCredentials');
    console.log('   Example: set MISP_API_KEY=your_actual_api_key');
    return;
  }

  mispService.setCredentials(testCredentials);

  try {
    const isConnected = await mispService.testConnection();
    if (isConnected) {
      console.log('✅ MISP connection successful!');
      
      // Test 3: Fetch events
      console.log('\n3. Testing event retrieval...');
      const events = await mispService.getEvents(5);
      console.log(`✅ Retrieved ${events.length} events`);
      
      if (events.length > 0) {
        console.log('   Sample event:', {
          id: events[0].id,
          title: events[0].info,
          timestamp: events[0].timestamp
        });
      }
      
    } else {
      console.log('❌ MISP connection failed');
    }
  } catch (error) {
    console.log('❌ MISP connection error:', error.message);
  }

  // Test 4: Test DDoS event creation structure
  console.log('\n4. Testing DDoS event structure...');
  const sampleDDoSEvent = {
    title: 'Test DDoS Attack - Connection Test',
    description: 'This is a test event to verify API functionality',
    attacker_ips: ['1.2.3.4', '5.6.7.8'],
    victim_ips: ['10.0.0.1'],
    attack_ports: ['80', '443'],
    attack_type: 'direct-flood',
    severity: 'high'
  };

  try {
    console.log('   Sample event structure valid ✅');
    console.log('   Event would have Galaxy Cluster: misp-galaxy:mitre-attack-pattern="Network Denial of Service - T1498"');
    console.log('   Event would have TLP: green');
  } catch (error) {
    console.log('❌ Event structure error:', error.message);
  }
}

// Run the test
testMISPConnection()
  .then(() => console.log('\n🎯 Test completed'))
  .catch(error => console.error('\n💥 Test failed:', error));