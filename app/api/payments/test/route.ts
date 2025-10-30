import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Payment System Test Endpoint
 * 
 * This endpoint helps test and debug the payment system:
 * - Check if payment_transactions table exists
 * - Verify environment variables are configured
 * - Test database connectivity
 * - Simulate a webhook payload for testing
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Test 1: Check environment variables
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      CPAY_WEBHOOK_SECRET: !!process.env.CPAY_WEBHOOK_SECRET,
    }

    // Test 2: Check if payment_transactions table exists
    let tableExists = false
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('id')
        .limit(1)
      
      tableExists = !error
    } catch (error) {
      tableExists = false
    }

    // Test 3: Check if users table is accessible
    let usersTableAccessible = false
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email')
        .limit(1)
      
      usersTableAccessible = !error
    } catch (error) {
      usersTableAccessible = false
    }

    // Test 4: Get sample user for testing
    let sampleUser = null
    try {
      const { data } = await supabase
        .from('users')
        .select('id, email, balance')
        .eq('email', 'admin@chronostime.com')
        .single()
      
      sampleUser = data
    } catch (error) {
      // Ignore error
    }

    return NextResponse.json({
      status: 'Payment system diagnostics',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      checks: {
        environment_variables: envCheck,
        payment_transactions_table_exists: tableExists,
        users_table_accessible: usersTableAccessible,
        sample_user_found: !!sampleUser
      },
      sample_user: sampleUser ? {
        id: sampleUser.id,
        email: sampleUser.email,
        balance: sampleUser.balance
      } : null,
      webhook_endpoint: `${request.nextUrl.origin}/api/payments/cpay-webhook`,
      recommendations: [
        !envCheck.CPAY_WEBHOOK_SECRET && "Configure CPAY_WEBHOOK_SECRET environment variable",
        !tableExists && "Create payment_transactions table using the provided SQL",
        !usersTableAccessible && "Check Supabase connection and permissions",
      ].filter(Boolean)
    })

  } catch (error) {
    console.error('Payment system test error:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, user_email, amount } = body

    if (action === 'simulate_payment') {
      // Simulate a CPay webhook for testing
      const simulatedWebhook = {
        status: 'completed',
        amount: amount || '100.00',
        currency: 'USD',
        customer_email: user_email || 'admin@chronostime.com',
        payment_id: `test_${Date.now()}`,
        transaction_id: `tx_${Date.now()}`,
        timestamp: new Date().toISOString()
      }

      // Forward to the actual webhook handler
      const webhookResponse = await fetch(`${request.nextUrl.origin}/api/payments/cpay-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-webhook': 'true'
        },
        body: JSON.stringify(simulatedWebhook)
      })

      const webhookResult = await webhookResponse.json()

      return NextResponse.json({
        status: 'Payment simulation completed',
        simulated_webhook: simulatedWebhook,
        webhook_response: webhookResult,
        webhook_status: webhookResponse.status,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({
      error: 'Invalid action. Use action: "simulate_payment"'
    }, { status: 400 })

  } catch (error) {
    console.error('Payment simulation error:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}