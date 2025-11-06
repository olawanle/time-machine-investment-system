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

    // Use the test function to check table status
    const { data: testResult, error: testError } = await supabase
      .rpc('test_payment_table')
      .single()

    if (testError) {
      console.error('Error testing payment table:', testError)
      return NextResponse.json({
        success: false,
        message: 'Failed to test payment table: ' + testError.message,
        table_exists: false,
        insert_test: false
      })
    }

    const tableExists = testResult?.table_exists || false
    const insertTest = testResult?.can_insert || false
    const message = testResult?.message || 'Unknown status'

    return NextResponse.json({
      success: tableExists && insertTest,
      message: message,
      table_exists: tableExists,
      insert_test: insertTest
    })

  } catch (error) {
    console.error('Database setup check error:', error)
    return NextResponse.json({
      error: 'Failed to check database setup'
    }, { status: 500 })
  }
}