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
    // Helper function to return error page for iframe
    const returnError = (errorMessage: string) => {
      const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Error</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            min-height: 100vh; 
            margin: 0; 
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
          }
          .error-container {
            text-align: center;
            padding: 2rem;
            background: rgba(255,255,255,0.1);
            border-radius: 1rem;
            backdrop-filter: blur(10px);
          }
          .error-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <div class="error-icon">❌</div>
          <h1>Payment Error</h1>
          <p>${errorMessage}</p>
          <p>Please try again or contact support.</p>
        </div>
        <script>
          // Notify parent window of payment error
          if (window.parent !== window) {
            window.parent.postMessage({
              type: 'PAYMENT_ERROR',
              message: '${errorMessage}'
            }, '*');
          }
        </script>
      </body>
      </html>
      `;
      return new NextResponse(errorHtml, {
        headers: { 'Content-Type': 'text/html' }
      });
    };

    if (!paymentId) {
      console.error('❌ Missing payment ID in callback')
      return returnError('Payment ID was missing from the callback')
    }

    if (!customerEmail) {
      console.error('❌ Missing customer email in callback')
      return returnError('Email was missing from the callback')
    }

    if (!amount) {
      console.error('❌ Missing amount in callback')
      return returnError('Amount was missing from the callback')
    }

    // Only process successful payments
    if (status !== 'success' && status !== 'completed' && status !== 'confirmed') {
      console.log(`ℹ️  Payment not successful: ${status}`)
      return returnError(`Payment was not successful. Status: ${status}`)
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
      return returnError('This payment has already been processed')
    }

    // Find the user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', customerEmail)
      .single()

    if (userError || !user) {
      console.error('❌ User not found:', customerEmail)
      return returnError('User account not found')
    }

    // Convert amount to number
    const usdAmount = parseFloat(amount)
    if (isNaN(usdAmount) || usdAmount <= 0) {
      console.error('❌ Invalid amount:', amount)
      return returnError('Invalid payment amount')
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
      return returnError('Database error occurred while recording transaction')
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
      return returnError('Failed to update account balance')
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

    // For iframe payments, return a success page that communicates with parent window
    const successHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Successful</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          min-height: 100vh; 
          margin: 0; 
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }
        .success-container {
          text-align: center;
          padding: 2rem;
          background: rgba(255,255,255,0.1);
          border-radius: 1rem;
          backdrop-filter: blur(10px);
        }
        .checkmark {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
      </style>
    </head>
    <body>
      <div class="success-container">
        <div class="checkmark">✅</div>
        <h1>Payment Successful!</h1>
        <p>$${usdAmount} has been added to your balance</p>
        <p>New balance: $${newBalance}</p>
        <p>This window will close automatically...</p>
      </div>
      <script>
        // Notify parent window of successful payment
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'PAYMENT_SUCCESS',
            amount: ${usdAmount},
            balance: ${newBalance},
            message: 'Payment successful! $${usdAmount} has been added to your balance.'
          }, '*');
        }
        
        // Auto-close after 3 seconds
        setTimeout(() => {
          if (window.parent !== window) {
            window.parent.postMessage({ type: 'CLOSE_PAYMENT_MODAL' }, '*');
          }
        }, 3000);
      </script>
    </body>
    </html>
    `;
    
    return new NextResponse(successHtml, {
      headers: { 'Content-Type': 'text/html' }
    })

  } catch (error) {
    console.error('❌ CPay callback error:', error)
    const errorHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Error</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          min-height: 100vh; 
          margin: 0; 
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }
        .error-container {
          text-align: center;
          padding: 2rem;
          background: rgba(255,255,255,0.1);
          border-radius: 1rem;
          backdrop-filter: blur(10px);
        }
        .error-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
      </style>
    </head>
    <body>
      <div class="error-container">
        <div class="error-icon">❌</div>
        <h1>Payment Error</h1>
        <p>A server error occurred while processing your payment</p>
        <p>Please try again or contact support.</p>
      </div>
      <script>
        // Notify parent window of payment error
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'PAYMENT_ERROR',
            message: 'A server error occurred while processing your payment'
          }, '*');
        }
      </script>
    </body>
    </html>
    `;
    return new NextResponse(errorHtml, {
      headers: { 'Content-Type': 'text/html' }
    })
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