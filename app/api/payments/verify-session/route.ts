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

    // Get updated user with all data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user_id)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
    }
    
    // Also fetch user's machines and referrals
    let fullUser = user
    if (user) {
      const { data: machines } = await supabase
        .from('time_machines')
        .select('*')
        .eq('user_id', user_id)
      
      const { data: referrals } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user_id)
      
      fullUser = {
        ...user,
        machines: machines || [],
        referrals: referrals?.map(r => r.referred_id) || []
      }
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        metadata: session.metadata
      },
      user: fullUser || null
    })

  } catch (error: any) {
    console.error('Error verifying session:', error)
    return NextResponse.json({
      error: error.message || 'Failed to verify session'
    }, { status: 500 })
  }
}
