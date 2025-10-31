import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Webhook Debug Endpoint
 * Check webhook logs and payment status
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

    // Check if payment_transactions table exists
    let tableExists = false
    let recentPayments: any[] = []
    
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (!error) {
        tableExists = true
        recentPayments = data || []
      }
    } catch (error) {
      tableExists = false
    }

    // Get recent users to check balance updates
    const { data: recentUsers } = await supabase
      .from('users')
      .select('id, email, balance, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5)

    return NextResponse.json({
      status: 'Webhook Debug Information',
      timestamp: new Date().toISOString(),
      checks: {
        payment_transactions_table_exists: tableExists,
        recent_payments_count: recentPayments.length,
        webhook_endpoint: `${request.nextUrl.origin}/api/payments/cpay-webhook`,
        manual_confirm_endpoint: `${request.nextUrl.origin}/api/payments/manual-confirm`
      },
      recent_payments: recentPayments,
      recent_users: recentUsers,
      troubleshooting: {
        step_1: "Check if payment_transactions table exists in Supabase",
        step_2: "Verify CPay webhook URL is configured correctly",
        step_3: "Check if CPay is sending webhooks to your endpoint",
        step_4: "Use manual confirmation if webhooks are not working",
        step_5: "Check server logs for webhook errors"
      },
      next_steps: [
        tableExists ? "✅ Payment table exists" : "❌ Create payment_transactions table in Supabase",
        "Configure CPay webhook URL: " + `${request.nextUrl.origin}/api/payments/cpay-webhook`,
        "Test webhook with manual confirmation tool",
        "Check CPay dashboard for webhook delivery status"
      ]
    })

  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      error: 'Debug endpoint failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}