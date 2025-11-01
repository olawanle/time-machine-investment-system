import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Secure Payment Verification and Confirmation Endpoint
 * 
 * This endpoint verifies payments with CPay API before confirming
 * Prevents users from manually entering incorrect amounts
 * 
 * Usage:
 * POST /api/payments/verify-and-confirm
 * {
 *   "payment_id": "cpay_payment_id",
 *   "user_email": "user@example.com",
 *   "user_id": "user123"
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const { payment_id, user_email, user_id } = await request.json()

    if (!payment_id || !user_email || !user_id) {
      return NextResponse.json({
        error: 'Missing required fields: payment_id, user_email, and user_id'
      }, { status: 400 })
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

    // Check if payment was already processed
    const { data: existingTransaction } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('payment_id', payment_id)
      .single()

    if (existingTransaction) {
      return NextResponse.json({
        error: 'Payment already processed',
        existing_transaction: existingTransaction
      }, { status: 409 })
    }

    // Find the user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user_id)
      .eq('email', user_email)
      .single()

    if (userError || !user) {
      return NextResponse.json({
        error: 'User not found or email mismatch'
      }, { status: 404 })
    }

    // Try to verify payment with CPay API
    let verifiedAmount = null
    let paymentStatus = 'unverified'

    const cpayApiKey = process.env.CPAY_API_KEY
    const cpayBaseUrl = process.env.CPAY_BASE_URL || 'https://api.cpay.com'

    if (cpayApiKey) {
      try {
        console.log(`🔍 Verifying payment ${payment_id} with CPay API...`)
        
        const response = await fetch(`${cpayBaseUrl}/v1/payments/${payment_id}`, {
          headers: {
            'Authorization': `Bearer ${cpayApiKey}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const paymentData = await response.json()
          console.log('📋 CPay payment data:', paymentData)
          
          if (paymentData.status === 'completed' || paymentData.status === 'paid' || paymentData.status === 'success') {
            verifiedAmount = parseFloat(paymentData.amount || paymentData.total || 0)
            paymentStatus = 'verified'
            
            console.log(`✅ Payment verified: $${verifiedAmount}`)
          } else {
            return NextResponse.json({
              error: `Payment not completed. Status: ${paymentData.status}`
            }, { status: 400 })
          }
        } else {
          console.log('⚠️ CPay API verification failed, using fallback verification')
        }
      } catch (apiError) {
        console.error('CPay API error:', apiError)
        console.log('⚠️ CPay API unavailable, using fallback verification')
      }
    }

    // Fallback verification: Check for recent payments in our callback logs
    if (!verifiedAmount) {
      console.log('🔍 Using fallback verification method...')
      
      // Look for recent callback data that might contain this payment
      const { data: recentCallbacks } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', user_id)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .order('created_at', { ascending: false })
        .limit(10)

      // Check if we have any unprocessed callbacks with this payment ID
      const matchingCallback = recentCallbacks?.find(t => 
        t.raw_webhook_data && 
        (t.raw_webhook_data.payment_id === payment_id || 
         t.raw_webhook_data.transaction_id === payment_id ||
         t.raw_webhook_data.id === payment_id)
      )

      if (matchingCallback) {
        verifiedAmount = matchingCallback.amount
        paymentStatus = 'callback_verified'
        console.log(`✅ Payment verified via callback: $${verifiedAmount}`)
      }
    }

    // If we still can't verify, require admin approval
    if (!verifiedAmount) {
      console.log('❌ Could not verify payment amount automatically')
      
      // Create a pending verification record
      await supabase
        .from('payment_transactions')
        .insert({
          payment_id: payment_id,
          user_id: user_id,
          amount: 0, // Will be updated when admin verifies
          currency: 'USD',
          status: 'pending_verification',
          raw_webhook_data: {
            verification_attempt: true,
            user_email: user_email,
            payment_id: payment_id,
            timestamp: new Date().toISOString(),
            note: 'Requires admin verification - could not verify amount automatically'
          },
          processed_at: null
        })

      return NextResponse.json({
        error: 'Payment verification required',
        message: 'We could not automatically verify your payment amount. Our team will review and process it within 24 hours.',
        status: 'pending_verification',
        payment_id: payment_id,
        next_steps: [
          'Your payment has been logged for manual review',
          'Our team will verify the amount with CPay',
          'Your balance will be updated within 24 hours',
          'You will receive an email confirmation'
        ]
      }, { status: 202 }) // 202 Accepted
    }

    // Verify amount is reasonable (between $1 and $10,000)
    if (verifiedAmount < 1 || verifiedAmount > 10000) {
      return NextResponse.json({
        error: `Invalid payment amount: $${verifiedAmount}. Must be between $1 and $10,000.`
      }, { status: 400 })
    }

    console.log(`💰 Processing verified payment: $${verifiedAmount} for user ${user.email}`)

    // Record the transaction
    const { error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        payment_id: payment_id,
        user_id: user_id,
        amount: verifiedAmount,
        currency: 'USD',
        status: paymentStatus,
        raw_webhook_data: {
          verified_confirmation: true,
          verification_method: paymentStatus,
          user_email: user_email,
          timestamp: new Date().toISOString()
        },
        processed_at: new Date().toISOString()
      })

    if (transactionError) {
      console.error('❌ Error recording transaction:', transactionError)
      return NextResponse.json({
        error: 'Failed to record transaction'
      }, { status: 500 })
    }

    // Update user balance
    const currentBalance = Number(user.balance ?? 0)
    const currentTotalInvested = Number(user.total_invested ?? 0)
    const newBalance = currentBalance + verifiedAmount
    const newTotalInvested = currentTotalInvested + verifiedAmount

    const { error: updateError } = await supabase
      .from('users')
      .update({
        balance: newBalance,
        total_invested: newTotalInvested,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)

    if (updateError) {
      console.error('❌ Error updating user balance:', updateError)
      return NextResponse.json({
        error: 'Failed to update balance'
      }, { status: 500 })
    }

    console.log('✅ Payment verified and processed successfully:', {
      payment_id,
      user_id,
      email: user.email,
      amount: verifiedAmount,
      previous_balance: currentBalance,
      new_balance: newBalance,
      verification_method: paymentStatus
    })

    return NextResponse.json({
      success: true,
      message: 'Payment verified and confirmed',
      payment_id,
      amount_credited: verifiedAmount,
      previous_balance: currentBalance,
      new_balance: newBalance,
      verification_method: paymentStatus,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Payment verification error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Secure payment verification endpoint',
    usage: 'POST with payment_id, user_email, and user_id',
    security_note: 'Verifies payment amounts with CPay API before confirming',
    timestamp: new Date().toISOString()
  })
}