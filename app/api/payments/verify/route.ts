import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { paymentRequestId } = await request.json()

    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get payment request
    const { data: paymentRequest, error: fetchError } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('id', paymentRequestId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !paymentRequest) {
      return NextResponse.json(
        { error: 'Payment request not found' },
        { status: 404 }
      )
    }

    // Check if payment is already completed
    if (paymentRequest.status === 'completed') {
      return NextResponse.json({
        success: true,
        isComplete: true,
        paymentRequest,
      })
    }

    // Check if payment has expired
    if (new Date(paymentRequest.expires_at) < new Date()) {
      await supabase
        .from('payment_requests')
        .update({ status: 'expired' })
        .eq('id', paymentRequestId)

      return NextResponse.json({
        success: false,
        error: 'Payment request expired',
      })
    }

    // TODO: Verify payment with blockchain or NOWPayments API
    // For now, return pending status
    return NextResponse.json({
      success: true,
      isComplete: false,
      paymentRequest,
    })
  } catch (error) {
    console.error('Verify payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
