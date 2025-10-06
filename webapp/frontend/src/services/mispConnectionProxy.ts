// MISP Connection Proxy Service
// This service uses GitHub Actions to test MISP connection when browser CORS blocks direct access

export interface MISPConnectionProxyResult {
  success: boolean;
  method: 'direct' | 'proxy';
  error?: string;
  details?: any;
  suggestion?: string;
}

export class MISPConnectionProxy {
  private githubConfig = {
    owner: 'PabloPenguin',
    repo: 'misp-ddos-automation',
  };

  // Test MISP connection via GitHub Actions (CORS workaround)
  async testConnectionViaProxy(mispUrl: string, apiKey: string): Promise<MISPConnectionProxyResult> {
    try {
      console.log('🔄 Testing MISP connection via GitHub Actions proxy...');
      
      // Trigger GitHub Actions workflow for connection test
      const workflowResponse = await fetch(`https://api.github.com/repos/${this.githubConfig.owner}/${this.githubConfig.repo}/actions/workflows/test-misp-connection.yml/dispatches`, {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          // Note: This requires a GitHub token, which we don't have in browser context
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            misp_url: mispUrl,
            test_connection: true
          }
        })
      });

      if (!workflowResponse.ok) {
        throw new Error(`GitHub API error: ${workflowResponse.status}`);
      }

      return {
        success: true,
        method: 'proxy',
        details: {
          message: 'Connection test initiated via GitHub Actions',
          workflow_triggered: true
        }
      };

    } catch (error) {
      console.error('Proxy connection test failed:', error);
      
      return {
        success: false,
        method: 'proxy',
        error: error instanceof Error ? error.message : 'Unknown proxy error',
        suggestion: 'GitHub Actions proxy requires authentication token'
      };
    }
  }

  // Simulate connection test result (for demo purposes)
  async simulateConnectionTest(mispUrl: string, apiKey: string): Promise<MISPConnectionProxyResult> {
    console.log('🎭 Simulating MISP connection test...');
    
    // Basic validation
    if (!mispUrl || !apiKey) {
      return {
        success: false,
        method: 'direct',
        error: 'Missing MISP URL or API key',
        suggestion: 'Ensure both MISP URL and API key are configured'
      };
    }

    if (!mispUrl.startsWith('https://')) {
      return {
        success: false,
        method: 'direct', 
        error: 'MISP URL must use HTTPS',
        suggestion: 'Update MISP URL to use HTTPS protocol'
      };
    }

    if (apiKey.length < 20) {
      return {
        success: false,
        method: 'direct',
        error: 'API key appears to be too short',
        suggestion: 'Verify your MISP API key is correct'
      };
    }

    // Simulate successful validation
    return {
      success: true,
      method: 'direct',
      details: {
        message: 'Configuration validation passed',
        misp_url: mispUrl,
        api_key_length: apiKey.length,
        simulated: true,
        note: 'Real connection test requires CLI or server-side validation due to CORS restrictions'
      },
      suggestion: 'Use the CLI to verify actual MISP connectivity: python cli/src/misp_client.py --test-connection'
    };
  }
}

export const mispConnectionProxy = new MISPConnectionProxy();