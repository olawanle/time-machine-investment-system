import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, user_id } = body

    if (!session_id) {
      return NextResponse.json({
        error: 'Session ID is required'
      }, { status: 400 })
    }

    const stripe = getStripe()
    
    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id)

    if (!session) {
      return NextResponse.json({
        error: 'Session not found'
      }, { status: 404 })
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json({
        error: 'Payment not completed',
        session
      }, { status: 400 })
    }

    // Verify the session belongs to this user
    if (session.metadata?.user_id !== user_id) {
      return NextResponse.json({
        error: 'Session does not belong to this user'
      }, { status: 403 })
    }

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

    // Get updated user balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, balance, email, username')
      .eq('id', user_id)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        metadata: session.metadata
      },
      user: user || null
    })

  } catch (error: any) {
    console.error('Error verifying session:', error)
    return NextResponse.json({
      error: error.message || 'Failed to verify session'
    }, { status: 500 })
  }
}
