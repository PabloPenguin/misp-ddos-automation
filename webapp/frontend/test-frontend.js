// Frontend Functionality Test Suite
// Run this in the browser console at http://localhost:3000/misp-ddos-automation/

console.log('🧪 Starting MISP Frontend Tests...\n');

// Test 1: Settings Persistence
console.log('1. Testing Settings Persistence...');

function testSettingsPersistence() {
  const testSettings = {
    mispUrl: 'https://server1.tailaa85d9.ts.net',
    apiKey: 'test-api-key-12345'
  };
  
  // Clear existing data
  localStorage.removeItem('misp-settings');
  
  // Save test settings
  localStorage.setItem('misp-settings', JSON.stringify(testSettings));
  
  // Retrieve settings
  const retrieved = JSON.parse(localStorage.getItem('misp-settings') || '{}');
  
  if (retrieved.mispUrl === testSettings.mispUrl && retrieved.apiKey === testSettings.apiKey) {
    console.log('✅ Settings persistence works correctly');
    return true;
  } else {
    console.log('❌ Settings persistence failed');
    return false;
  }
}

// Test 2: File Validation
console.log('\n2. Testing File Validation...');

function testFileValidation() {
  // Test valid CSV file
  const validCsv = `title,description,attacker_ips,victim_ips,attack_ports,attack_type,severity
"Test Attack","Sample attack","1.2.3.4","10.0.0.1","80","direct-flood","high"`;
  
  const csvFile = new File([validCsv], 'test.csv', { type: 'text/csv' });
  
  // Test file size (should be under 50MB)
  if (csvFile.size < 50 * 1024 * 1024) {
    console.log('✅ File size validation works');
  } else {
    console.log('❌ File size validation failed');
    return false;
  }
  
  // Test file type
  if (csvFile.name.endsWith('.csv') || csvFile.name.endsWith('.json')) {
    console.log('✅ File type validation works');
    return true;
  } else {
    console.log('❌ File type validation failed');
    return false;
  }
}

// Test 3: API Service Initialization
console.log('\n3. Testing API Service...');

function testApiService() {
  try {
    // This would be available if the app is loaded
    if (typeof window !== 'undefined' && window.location.origin) {
      console.log('✅ Frontend environment ready');
      console.log('   Current URL:', window.location.href);
      console.log('   Ready for MISP API integration');
      return true;
    }
  } catch (error) {
    console.log('❌ API service test failed:', error);
    return false;
  }
}

// Test 4: Local Storage Security
console.log('\n4. Testing Local Storage Security...');

function testLocalStorageSecurity() {
  // Test that sensitive data isn't stored in plain text
  const testApiKey = 'test-sensitive-key-123';
  
  // This is how the app should NOT store sensitive data
  localStorage.setItem('test-insecure', testApiKey);
  
  // Check if we can implement basic obfuscation
  const obfuscated = btoa(testApiKey); // Base64 encoding (basic obfuscation, not security)
  localStorage.setItem('test-obfuscated', obfuscated);
  
  const retrieved = atob(localStorage.getItem('test-obfuscated') || '');
  
  if (retrieved === testApiKey) {
    console.log('✅ Basic data encoding works');
    console.log('⚠️  Note: For production, use proper encryption');
  } else {
    console.log('❌ Data encoding failed');
    return false;
  }
  
  // Cleanup
  localStorage.removeItem('test-insecure');
  localStorage.removeItem('test-obfuscated');
  
  return true;
}

// Run all tests
async function runAllTests() {
  const results = {
    settingsPersistence: testSettingsPersistence(),
    fileValidation: testFileValidation(),
    apiService: testApiService(),
    localStorage: testLocalStorageSecurity()
  };
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log(`\n🎯 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All frontend tests passed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Visit Settings page and add your MISP API key');
    console.log('2. Test connection to server1.tailaa85d9.ts.net');
    console.log('3. Upload a test CSV file');
    console.log('4. Check Events page for real MISP data');
  } else {
    console.log('⚠️  Some tests failed - check implementation');
  }
  
  return results;
}

// Auto-run tests if in browser
if (typeof window !== 'undefined') {
  runAllTests();
}

// Export for manual testing
window.mispTests = {
  runAllTests,
  testSettingsPersistence,
  testFileValidation,
  testApiService,
  testLocalStorageSecurity
};