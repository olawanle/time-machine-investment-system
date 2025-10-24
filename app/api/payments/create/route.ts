import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { machineId, amount, paymentMethod } = await request.json()

    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create payment request in database
    const { data: paymentRequest, error: insertError } = await supabase
      .from('payment_requests')
      .insert({
        user_id: user.id,
        machine_id: machineId,
        amount,
        payment_method: paymentMethod,
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      })
      .select()
      .single()

    if (insertError) {
      console.error('Payment request creation error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create payment request' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      paymentRequest,
    })
  } catch (error) {
    console.error('Create payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
