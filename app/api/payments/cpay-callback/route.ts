import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * CPay Callback Handler
 * 
 * This endpoint handles the callback from CPay after a successful payment.
 * CPay redirects users here with payment information in the URL parameters.
 * 
 * Expected parameters from CPay:
 * - payment_id: Unique payment identifier
 * - amount: Payment amount
 * - status: Payment status (success, failed, etc.)
 * - customer_email: User's email address
 * - transaction_id: Transaction identifier
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract payment information from URL parameters
    const paymentId = searchParams.get('payment_id') || searchParams.get('id') || searchParams.get('transaction_id')
    const amount = searchParams.get('amount')
    const status = searchParams.get('status')
    const customerEmail = searchParams.get('customer_email') || searchParams.get('email')
    const transactionId = searchParams.get('transaction_id')
    
    console.log('📥 CPay callback received:', {
      paymentId,
      amount,
      status,
      customerEmail,
      transactionId,
      allParams: Object.fromEntries(searchParams.entries())
    })

    // Validate required parameters
    if (!paymentId) {
      console.error('❌ Missing payment ID in callback')
      return NextResponse.redirect(new URL('/dashboard?payment=error&reason=missing_payment_id', request.url))
    }

    if (!customerEmail) {
      console.error('❌ Missing customer email in callback')
      return NextResponse.redirect(new URL('/dashboard?payment=error&reason=missing_email', request.url))
    }

    if (!amount) {
      console.error('❌ Missing amount in callback')
      return NextResponse.redirect(new URL('/dashboard?payment=error&reason=missing_amount', request.url))
    }

    // Only process successful payments
    if (status !== 'success' && status !== 'completed' && status !== 'confirmed') {
      console.log(`ℹ️  Payment not successful: ${status}`)
      return NextResponse.redirect(new URL(`/dashboard?payment=failed&status=${status}`, request.url))
    }

    // Create Supabase admin client
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

    // Check if payment was already processed (idempotency)
    const { data: existingTransaction } = await supabase
      .from('payment_transactions')
      .select('id, user_id, amount, processed_at')
      .eq('payment_id', paymentId)
      .single()

    if (existingTransaction) {
      console.log('⚠️  Payment already processed:', paymentId)
      return NextResponse.redirect(new URL('/dashboard?payment=already_processed', request.url))
    }

    // Find the user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', customerEmail)
      .single()

    if (userError || !user) {
      console.error('❌ User not found:', customerEmail)
      return NextResponse.redirect(new URL('/dashboard?payment=error&reason=user_not_found', request.url))
    }

    // Convert amount to number
    const usdAmount = parseFloat(amount)
    if (isNaN(usdAmount) || usdAmount <= 0) {
      console.error('❌ Invalid amount:', amount)
      return NextResponse.redirect(new URL('/dashboard?payment=error&reason=invalid_amount', request.url))
    }

    console.log(`💰 Processing payment: $${usdAmount} for user ${user.email} (ID: ${user.id})`)

    // Record the transaction
    const { error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        payment_id: paymentId,
        user_id: user.id,
        amount: usdAmount,
        currency: 'USD',
        status: status || 'completed',
        raw_webhook_data: {
          callback_data: Object.fromEntries(searchParams.entries()),
          processed_via: 'cpay_callback',
          timestamp: new Date().toISOString()
        },
        processed_at: new Date().toISOString()
      })

    if (transactionError) {
      console.error('❌ Error recording transaction:', transactionError)
      return NextResponse.redirect(new URL('/dashboard?payment=error&reason=database_error', request.url))
    }

    // Update user balance
    const currentBalance = Number(user.balance ?? 0)
    const currentTotalInvested = Number(user.total_invested ?? 0)
    const newBalance = currentBalance + usdAmount
    const newTotalInvested = currentTotalInvested + usdAmount

    const { error: updateError } = await supabase
      .from('users')
      .update({
        balance: newBalance,
        total_invested: newTotalInvested,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('❌ Error updating user balance:', updateError)
      return NextResponse.redirect(new URL('/dashboard?payment=error&reason=balance_update_failed', request.url))
    }

    // Success!
    console.log('✅ Payment processed successfully:', {
      payment_id: paymentId,
      user_id: user.id,
      email: user.email,
      amount: usdAmount,
      previous_balance: currentBalance,
      new_balance: newBalance,
      timestamp: new Date().toISOString()
    })

    // Redirect to dashboard with success message
    return NextResponse.redirect(new URL(`/dashboard?payment=success&amount=${usdAmount}&balance=${newBalance}`, request.url))

  } catch (error) {
    console.error('❌ CPay callback error:', error)
    return NextResponse.redirect(new URL('/dashboard?payment=error&reason=server_error', request.url))
  }
}

// Also handle POST requests in case CPay sends POST callbacks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📥 CPay POST callback received:', body)
    
    // Convert POST data to URL parameters and redirect to GET handler
    const params = new URLSearchParams()
    Object.entries(body).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, String(value))
      }
    })
    
    const callbackUrl = new URL('/api/payments/cpay-callback', request.url)
    callbackUrl.search = params.toString()
    
    // Process the same way as GET
    return GET(new NextRequest(callbackUrl.toString()))
    
  } catch (error) {
    console.error('❌ CPay POST callback error:', error)
    return NextResponse.redirect(new URL('/dashboard?payment=error&reason=post_callback_error', request.url))
  }
}