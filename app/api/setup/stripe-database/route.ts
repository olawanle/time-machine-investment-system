import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
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
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'payment_transactions')

    if (tablesError) {
      console.error('Error checking tables:', tablesError)
      return NextResponse.json({
        error: 'Failed to check database tables'
      }, { status: 500 })
    }

    const tableExists = tables && tables.length > 0

    if (!tableExists) {
      return NextResponse.json({
        success: false,
        message: 'Payment transactions table does not exist. Please run the SQL migration.',
        table_exists: false
      })
    }

    // Test inserting a sample transaction (will be rolled back)
    const testTransaction = {
      user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      stripe_session_id: 'test_session_' + Date.now(),
      amount: 10.00,
      currency: 'usd',
      status: 'pending',
      payment_method: 'stripe',
      metadata: { test: true }
    }

    const { error: insertError } = await supabase
      .from('payment_transactions')
      .insert(testTransaction)

    if (insertError) {
      console.error('Error testing insert:', insertError)
      return NextResponse.json({
        success: false,
        message: 'Payment transactions table exists but insert failed: ' + insertError.message,
        table_exists: true,
        insert_test: false
      })
    }

    // Clean up test transaction
    await supabase
      .from('payment_transactions')
      .delete()
      .eq('stripe_session_id', testTransaction.stripe_session_id)

    return NextResponse.json({
      success: true,
      message: 'Database is properly configured for Stripe payments',
      table_exists: true,
      insert_test: true
    })

  } catch (error) {
    console.error('Database setup check error:', error)
    return NextResponse.json({
      error: 'Failed to check database setup'
    }, { status: 500 })
  }
}