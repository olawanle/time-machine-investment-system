# Stripe Payment Gateway Setup Guide

## Overview
This guide will help you set up Stripe as the payment gateway for ChronosTime. All previous payment gateways (CPay, manual confirmations, etc.) have been removed and replaced with a clean Stripe implementation.

## Required Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key (starts with sk_test_ for test mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe publishable key (starts with pk_test_ for test mode)
STRIPE_WEBHOOK_SECRET=whsec_... # Your Stripe webhook endpoint secret

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com # Your app's URL for redirects
```

## Stripe Account Setup

### 1. Create Stripe Account
1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a new account or log in to existing account
3. Complete account verification process

### 2. Get API Keys
1. Go to Stripe Dashboard → Developers → API keys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)
4. Add these to your `.env.local` file

### 3. Set Up Webhook Endpoint
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Set endpoint URL to: `https://yourdomain.com/api/payments/stripe-webhook`
4. Select these events to listen for:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret (starts with `whsec_`)
6. Add it to your `.env.local` file as `STRIPE_WEBHOOK_SECRET`

## Database Setup

Run the SQL script to create the payment transactions table:

```sql
-- Run this in your Supabase SQL editor or database
-- File: stripe-payment-transactions-table.sql
```

## Files Created/Modified

### New Files Created:
- `lib/stripe.ts` - Server-side Stripe configuration
- `lib/stripe-client.ts` - Client-side Stripe configuration
- `app/api/payments/create-checkout-session/route.ts` - Create Stripe checkout sessions
- `app/api/payments/stripe-webhook/route.ts` - Handle Stripe webhooks
- `app/api/payments/verify-session/route.ts` - Verify payment sessions
- `stripe-payment-transactions-table.sql` - Database schema
- `STRIPE_SETUP_GUIDE.md` - This setup guide

### Files Modified:
- `components/balance-topup.tsx` - Updated to use Stripe checkout
- `app/payment-success/page.tsx` - Updated to handle Stripe sessions

### Files Removed:
- All CPay-related API endpoints
- `components/iframe-payment.tsx`
- `components/manual-payment-confirm.tsx`
- All old payment gateway files

## Testing

### Test Mode
1. Use test API keys (starting with `sk_test_` and `pk_test_`)
2. Use test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **Requires authentication**: `4000 0025 0000 3155`
3. Use any future expiry date and any 3-digit CVC

### Test Payment Flow
1. Go to balance top-up page
2. Enter amount (minimum $10)
3. Click "Pay with Card"
4. Complete payment with test card
5. Verify balance updates in dashboard

## Production Setup

### 1. Switch to Live Mode
1. In Stripe Dashboard, toggle to "Live mode"
2. Get live API keys (starting with `sk_live_` and `pk_live_`)
3. Update environment variables with live keys
4. Update webhook endpoint URL to production domain

### 2. Webhook Security
- Ensure webhook endpoint is accessible from Stripe
- Verify webhook signature validation is working
- Monitor webhook delivery in Stripe Dashboard

### 3. Security Checklist
- [ ] Live API keys are secure and not exposed
- [ ] Webhook endpoint validates signatures
- [ ] HTTPS is enabled on production domain
- [ ] Database has proper RLS policies
- [ ] Error handling doesn't expose sensitive data

## Features

### Payment Processing
- **Secure Checkout**: Stripe-hosted checkout pages
- **Multiple Payment Methods**: Credit/debit cards, digital wallets
- **Instant Processing**: Balance updates immediately after payment
- **Automatic Reconciliation**: Webhooks handle payment confirmations

### User Experience
- **Quick Amounts**: Pre-set amount buttons ($50, $100, $250, $500, $1000)
- **Minimum/Maximum**: $10 minimum, $10,000 maximum per transaction
- **Success Handling**: Automatic redirect after successful payment
- **Error Handling**: Clear error messages and retry options

### Security
- **PCI Compliance**: Stripe handles all card data
- **Webhook Verification**: Cryptographic signature validation
- **Database Security**: Row-level security policies
- **No Card Storage**: Card details never touch your servers

## Monitoring

### Stripe Dashboard
- Monitor payments in real-time
- View failed payments and reasons
- Track webhook delivery status
- Generate financial reports

### Application Logs
- Payment creation attempts
- Webhook processing results
- User balance updates
- Error conditions

## Support

### Common Issues
1. **Webhook not receiving events**: Check endpoint URL and firewall settings
2. **Payment not updating balance**: Check webhook signature validation
3. **Test payments failing**: Verify test API keys are being used
4. **Production payments failing**: Ensure live mode is enabled

### Debugging
- Check Stripe Dashboard for payment status
- Review webhook delivery logs
- Monitor application error logs
- Verify database transaction records

## Cost Structure

### Stripe Fees
- **Online payments**: 2.9% + 30¢ per successful charge
- **International cards**: Additional 1.5%
- **Disputes**: $15 per chargeback
- **No monthly fees**: Pay only for successful transactions

### Recommended Pricing Strategy
- Consider adding processing fees to user amounts
- Or absorb fees into your business model
- Minimum $10 helps offset fixed 30¢ fee

## Next Steps

1. **Set up Stripe account** and get API keys
2. **Configure environment variables** in your deployment
3. **Run database migration** to create payment tables
4. **Set up webhook endpoint** in Stripe Dashboard
5. **Test payment flow** with test cards
6. **Deploy to production** with live API keys
7. **Monitor payments** and webhook delivery

Your Stripe payment gateway is now ready for production use!