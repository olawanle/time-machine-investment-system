import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const config = {
      stripe_secret_key: !!process.env.STRIPE_SECRET_KEY,
      stripe_publishable_key: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      stripe_webhook_secret: !!process.env.STRIPE_WEBHOOK_SECRET,
      app_url: !!process.env.NEXT_PUBLIC_APP_URL,
      supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabase_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }

    const allConfigured = Object.values(config).every(Boolean)

    // Test Stripe connection (without exposing keys)
    let stripeConnectionTest = false
    try {
      if (process.env.STRIPE_SECRET_KEY) {
        const { getStripe } = await import('@/lib/stripe')
        const stripe = getStripe()
        // Test with a simple API call that doesn't require authentication
        await stripe.products.list({ limit: 1 })
        stripeConnectionTest = true
      }
    } catch (error: any) {
      console.error('Stripe connection test failed:', error.message)
    }

    return NextResponse.json({
      success: allConfigured && stripeConnectionTest,
      environment_variables: config,
      stripe_connection: stripeConnectionTest,
      missing_variables: Object.entries(config)
        .filter(([key, value]) => !value)
        .map(([key]) => key),
      message: allConfigured 
        ? (stripeConnectionTest ? 'All configuration is correct!' : 'Environment variables set but Stripe connection failed')
        : 'Some environment variables are missing'
    })

  } catch (error) {
    console.error('Configuration test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to test configuration'
    }, { status: 500 })
  }
}