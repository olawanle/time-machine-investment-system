# 🔧 CPay Callback Setup Guide

## ✅ What We've Fixed

Since CPay uses **Callback URI** instead of webhooks, I've created a proper callback handler that will automatically process payments when users complete their payment.

## 🚀 Setup Instructions

### Step 1: Configure CPay Callback URI

In your CPay dashboard (as shown in your screenshot):

1. **Go to Settings** → **Me** tab
2. **Find "Callback URI" field**
3. **Enter this URL**: `https://your-domain.vercel.app/api/payments/cpay-callback`
4. **Replace `your-domain.vercel.app`** with your actual Vercel domain
5. **Click "Submit"**

### Step 2: Verify Database Table Exists

You mentioned you already added the transactions table - great! If you need to verify:

1. Go to **Supabase Dashboard** → **Table Editor**
2. Look for **`payment_transactions`** table
3. Should have columns: `id`, `payment_id`, `user_id`, `amount`, `currency`, `status`, etc.

## 🔄 How It Works Now

### Payment Flow:
1. **User clicks "Top Up Balance"** → Redirected to CPay checkout
2. **User completes payment** → CPay processes the cryptocurrency payment  
3. **CPay redirects back** → User sent to `/api/payments/cpay-callback` with payment data
4. **Callback processes payment** → Updates user balance in database
5. **User redirected to dashboard** → Sees success message and updated balance

### Callback Parameters:
CPay will send these parameters in the callback URL:
- `payment_id` - Unique payment identifier
- `amount` - Payment amount in USD
- `status` - Payment status (success, completed, etc.)
- `customer_email` - User's email address
- `transaction_id` - Transaction reference

## 🧪 Testing the Setup

### Test 1: Check Callback Endpoint
Visit: `https://your-domain.vercel.app/api/payments/cpay-callback?test=true`
- Should redirect to dashboard (won't process without proper payment data)

### Test 2: Check Debug Info
Visit: `https://your-domain.vercel.app/api/debug/webhook-logs`
- Should show system status and recent activity

### Test 3: Make a Small Test Payment
1. **Make a $1-5 test payment** through CPay
2. **Complete the payment process**
3. **You should be redirected** to your dashboard
4. **Check if balance updated** - should see success message
5. **Check database** - should see new record in `payment_transactions` table

## 🔍 Troubleshooting

### If Payment Doesn't Update Balance:

1. **Check CPay Callback URL** - Make sure it's exactly: `https://your-domain.vercel.app/api/payments/cpay-callback`

2. **Check Server Logs** in Vercel:
   - Go to Vercel Dashboard → Your Project → Functions
   - Look for `/api/payments/cpay-callback` logs
   - Check for any errors

3. **Check Database**:
   - Go to Supabase → Table Editor → `payment_transactions`
   - Look for new records after payment

4. **Manual Fix** (if needed):
   - Open `manual-payment-fix.html` in browser
   - Enter payment details from CPay dashboard
   - Click "Confirm Payment" to manually add balance

### Common Issues:

- **"User not found"** → Email in CPay doesn't match registered email
- **"Payment already processed"** → Payment was already handled (normal)
- **"Invalid amount"** → Amount parameter is missing or invalid
- **"Database error"** → Check if `payment_transactions` table exists

## 📋 CPay Dashboard Configuration

Based on your screenshot, make sure these are set:

- **Callback URI**: `https://your-domain.vercel.app/api/payments/cpay-callback`
- **Your domain**: Should match your actual website URL
- **Email for Notifications**: Your support email
- **Company name**: ChronosTime (or your company name)

## ✅ Success Indicators

After setup, you should see:
1. **Successful redirect** after payment completion
2. **Success message** on dashboard: "Payment successful! $X has been added to your balance"
3. **Updated balance** displayed immediately
4. **Transaction record** in database with payment details

## 🆘 If Still Not Working

1. **Double-check callback URL** in CPay dashboard
2. **Verify domain spelling** (common issue)
3. **Check if HTTPS is working** on your domain
4. **Use manual confirmation tool** as backup
5. **Check Vercel function logs** for errors

The callback system is more reliable than webhooks since the user is redirected through it, ensuring the payment is always processed!