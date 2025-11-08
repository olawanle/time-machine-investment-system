import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id } = body

    if (!session_id) {
      return NextResponse.json({
        error: 'Session ID is required'
      }, { status: 400 })
    }

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(session_id)

    if (!session) {
      return NextResponse.json({
        error: 'Session not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      user_id: session.metadata?.user_id || null,
      email: session.customer_email || session.customer_details?.email || null
    })

  } catch (error: any) {
    console.error('Error getting session user:', error)
    return NextResponse.json({
      error: error.message || 'Failed to get session user'
    }, { status: 500 })
  }
}
