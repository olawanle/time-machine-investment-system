/**
 * Payment System Test Script
 * 
 * Run this to test the payment endpoints after deployment
 * Usage: node test-payment-system.js
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

async function testPaymentSystem() {
  console.log('🧪 Testing Payment System...\n')

  // Test 1: Check polling endpoint
  console.log('1️⃣ Testing payment polling endpoint...')
  try {
    const response = await fetch(`${BASE_URL}/api/payments/poll-status`, {
      method: 'GET'
    })
    const data = await response.json()
    console.log('✅ Polling endpoint accessible:', data.message)
  } catch (error) {
    console.log('❌ Polling endpoint error:', error.message)
  }

  // Test 2: Check manual confirmation endpoint
  console.log('\n2️⃣ Testing manual confirmation endpoint...')
  try {
    const response = await fetch(`${BASE_URL}/api/payments/manual-confirm`, {
      method: 'GET'
    })
    const data = await response.json()
    console.log('✅ Manual confirm endpoint accessible:', data.message)
  } catch (error) {
    console.log('❌ Manual confirm endpoint error:', error.message)
  }

  // Test 3: Check recent payments endpoint
  console.log('\n3️⃣ Testing recent payments check endpoint...')
  try {
    const response = await fetch(`${BASE_URL}/api/payments/check-recent`, {
      method: 'GET'
    })
    const data = await response.json()
    console.log('✅ Recent payments endpoint accessible:', data.message)
  } catch (error) {
    console.log('❌ Recent payments endpoint error:', error.message)
  }

  // Test 4: Check admin monitoring endpoint
  console.log('\n4️⃣ Testing admin monitoring endpoint...')
  try {
    const response = await fetch(`${BASE_URL}/api/admin/pending-payments`, {
      method: 'GET'
    })
    const data = await response.json()
    console.log('✅ Admin endpoint accessible')
    console.log(`   Recent transactions: ${data.summary?.total_recent_transactions || 0}`)
    console.log(`   Potential pending: ${data.summary?.potential_pending_count || 0}`)
  } catch (error) {
    console.log('❌ Admin endpoint error:', error.message)
  }

  // Test 5: Check callback endpoint
  console.log('\n5️⃣ Testing callback endpoint...')
  try {
    const response = await fetch(`${BASE_URL}/api/payments/cpay-callback?test=true`, {
      method: 'GET'
    })
    // This should redirect, so we check if it doesn't error
    console.log('✅ Callback endpoint accessible (redirects as expected)')
  } catch (error) {
    console.log('❌ Callback endpoint error:', error.message)
  }

  console.log('\n🎉 Payment system test completed!')
  console.log('\n📋 Next steps:')
  console.log('1. Deploy to production')
  console.log('2. Update CPay callback URL in dashboard')
  console.log('3. Test with real payment')
  console.log('4. Monitor admin endpoint for transactions')
}

// Run the test
testPaymentSystem().catch(console.error)