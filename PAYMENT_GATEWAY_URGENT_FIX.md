# 🚨 URGENT: Payment Gateway Not Working - Step-by-Step Fix

## The Problem
Payment shows successful in CPay gateway but balance is not updated on the website.

## Root Cause Analysis
The issue is likely one of these:
1. **Missing Database Table** - `payment_transactions` table doesn't exist
2. **Webhook Not Configured** - CPay isn't sending webhooks to your server
3. **Webhook Failing** - Server is receiving webhooks but they're failing

## 🔧 IMMEDIATE FIXES (Do These Now)

### Step 1: Create the Missing Database Table
1. **Go to your Supabase Dashboard** → SQL Editor
2. **Copy and paste this SQL script**:

```sql
-- Create payment_transactions table for webhook idempotency and payment tracking
create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  payment_id text unique not null,
  user_id uuid references public.users(id) on delete cascade,
  amount numeric not null,
  currency text default 'USD',
  status text not null,
  raw_webhook_data jsonb,
  processed_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.payment_transactions enable row level security;

-- RLS Policies
create policy "Users can view own payment transactions"
  on public.payment_transactions for select
  using (auth.uid() = user_id);

create policy "System can insert payment transactions"
  on public.payment_transactions for insert
  with check (true);

-- Create indexes
create index if not exists idx_payment_transactions_payment_id on public.payment_transactions(payment_id);
create index if not exists idx_payment_transactions_user_id on public.payment_transactions(user_id);
create index if not exists idx_payment_transactions_processed_at on public.payment_transactions(processed_at);
```

3. **Click "Run"** to execute the script

### Step 2: Configure CPay Webhook
1. **Login to CPay Dashboard** at https://cpay.world
2. **Go to Settings** → Developer/API → Webhooks
3. **Set Webhook URL** to: `https://your-domain.vercel.app/api/payments/cpay-webhook`
4. **Subscribe to events**: `payment.completed`, `payment.success`, `payment.confirmed`
5. **Save the configuration**

### Step 3: Test the System
1. **Open this URL** in your browser: `https://your-domain.vercel.app/api/debug/webhook-logs`
2. **Check if the payment table exists**
3. **Look for any recent payments or errors**

### Step 4: Manual Payment Confirmation (Immediate Fix)
If webhooks still don't work, use manual confirmation:

1. **Open the `manual-payment-fix.html` file** in your browser
2. **Fill in the form**:
   - Domain: Your website URL
   - Email: The user's email who made the payment
   - Amount: The payment amount
   - Payment ID: Get this from CPay dashboard
3. **Click "Confirm Payment"**
4. **The balance will be updated immediately**

## 🔍 DEBUGGING STEPS

### Check 1: Verify Database Table
Visit: `https://your-domain.vercel.app/api/payments/test`
- Should show `payment_transactions_table_exists: true`

### Check 2: Test Webhook Endpoint
Visit: `https://your-domain.vercel.app/api/payments/cpay-webhook`
- Should return webhook status information

### Check 3: Check Recent Activity
Visit: `https://your-domain.vercel.app/api/debug/webhook-logs`
- Shows recent payments and user balance updates

### Check 4: Simulate a Payment
```bash
curl -X POST https://your-domain.vercel.app/api/payments/test \
  -H "Content-Type: application/json" \
  -d '{
    "action": "simulate_payment",
    "user_email": "your-email@example.com",
    "amount": "100.00"
  }'
```

## 🚀 QUICK MANUAL FIX FOR EXISTING PAYMENTS

If you have payments that already went through but didn't update balances:

1. **Check CPay Dashboard** for successful payment IDs
2. **Use the manual confirmation tool** for each payment
3. **Or use this API call** for each payment:

```bash
curl -X POST https://your-domain.vercel.app/api/payments/manual-confirm \
  -H "Content-Type: application/json" \
  -d '{
    "payment_id": "cpay_payment_id_here",
    "user_email": "user@example.com",
    "amount": 100.00,
    "notes": "Manual confirmation - webhook failed"
  }'
```

## ✅ VERIFICATION

After implementing the fixes:
1. **Make a small test payment** ($1-5)
2. **Check if balance updates** within 2-3 minutes
3. **If not, use manual confirmation**
4. **Check webhook logs** for any errors

## 🆘 IF STILL NOT WORKING

1. **Check server logs** in Vercel dashboard
2. **Verify CPay is sending webhooks** (check their dashboard)
3. **Use manual confirmation** as a temporary solution
4. **Contact CPay support** to verify webhook configuration

The manual confirmation tool will work immediately while you debug the webhook issue!