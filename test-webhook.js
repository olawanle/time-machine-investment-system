// Test script to check if webhook endpoint is working
// Run this with: node test-webhook.js

const testWebhook = async () => {
  try {
    // Test the webhook health check first
    console.log('🔍 Testing webhook health check...');
    const healthResponse = await fetch('https://your-domain.vercel.app/api/payments/cpay-webhook', {
      method: 'GET'
    });
    
    const healthData = await healthResponse.json();
    console.log('Health check result:', healthData);
    
    // Test the diagnostic endpoint
    console.log('\n🔍 Testing payment system diagnostics...');
    const diagResponse = await fetch('https://your-domain.vercel.app/api/payments/test', {
      method: 'GET'
    });
    
    const diagData = await diagResponse.json();
    console.log('Diagnostics result:', diagData);
    
    // Test a simulated webhook
    console.log('\n🔍 Testing simulated payment...');
    const simulateResponse = await fetch('https://your-domain.vercel.app/api/payments/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'simulate_payment',
        user_email: 'your-email@example.com', // Replace with your actual email
        amount: '100.00'
      })
    });
    
    const simulateData = await simulateResponse.json();
    console.log('Simulation result:', simulateData);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Replace 'your-domain.vercel.app' with your actual domain
// Replace 'your-email@example.com' with your actual email
testWebhook();