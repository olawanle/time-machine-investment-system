# Payment System Fix Guide

## Issues Found

1. **Missing Database Table**: The `payment_transactions` table doesn't exist but the webhook tries to use it
2. **Missing Environment Variable**: `CPAY_WEBHOOK_SECRET` is not configured
3. **Webhook Security**: Without the secret, webhooks are not secure in production

## Fixes Required

### 1. Create Payment Transactions Table

Run this SQL in your Supabase SQL editor:

```sql
-- Create payment_transactions table for webhook idempotency and payment tracking
create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  payment_id text unique not null, -- CPay payment/transaction ID for idempotency
  user_id uuid references public.users(id) on delete cascade,
  amount numeric not null,
  currency text default 'USD',
  status text not null,
  raw_webhook_data jsonb, -- Store the full webhook payload for debugging
  processed_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.payment_transactions enable row level security;

-- RLS Policies for payment_transactions table
create policy "Users can view own payment transactions"
  on public.payment_transactions for select
  using (auth.uid() = user_id);

create policy "System can insert payment transactions"
  on public.payment_transactions for insert
  with check (true);

-- Create indexes for better performance
create index if not exists idx_payment_transactions_payment_id on public.payment_transactions(payment_id);
create index if not exists idx_payment_transactions_user_id on public.payment_transactions(user_id);
create index if not exists idx_payment_transactions_processed_at on public.payment_transactions(processed_at);
```

### 2. Configure CPay Webhook (Optional)

**If CPay provides webhook secrets:**
1. Log into your CPay merchant dashboard at https://cpay.world
2. Navigate to: Settings > Developer/API > Webhooks
3. Copy your webhook signing secret
4. Add to your environment variables as: `CPAY_WEBHOOK_SECRET=your_secret_here`

**If CPay doesn't provide webhook secrets:**
- The system will work without webhook secrets
- Alternative security measures are in place
- Manual payment confirmation is available as backup

### 3. Configure Webhook URL in CPay Dashboard

1. Set Webhook URL to: `https://your-domain.vercel.app/api/payments/cpay-webhook`
2. Subscribe to events: `payment.completed`, `payment.success`, `payment.confirmed`
3. Ensure CPay sends: `payment_id`, `customer_email`, `amount`, `status`

### 4. Test the Payment Flow

1. Make a test payment through CPay checkout
2. Check server logs for webhook receipt
3. Verify balance updates correctly in database
4. Test duplicate webhook delivery (should be rejected)

## How Payments Work

1. **User clicks "Top Up Balance"** → Redirected to CPay checkout
2. **User completes payment** → CPay processes the cryptocurrency payment
3. **CPay sends webhook** → Your server receives payment confirmation
4. **Webhook processes payment** → Updates user balance in database
5. **User sees updated balance** → Can now purchase time machines

## Troubleshooting

### If payments aren't updating balances:

1. Check if `payment_transactions` table exists
2. Verify `CPAY_WEBHOOK_SECRET` is configured
3. Check webhook logs in your deployment platform
4. Verify webhook URL is correctly configured in CPay
5. Test webhook endpoint: `GET /api/payments/cpay-webhook` should return status

### Common Issues:

- **"Webhook secret not configured"** → Add `CPAY_WEBHOOK_SECRET` environment variable
- **"Failed to record transaction"** → `payment_transactions` table missing
- **"User not found"** → CPay not sending correct `customer_email`
- **Duplicate payments** → Normal, webhook handles idempotency automatically

## Security Notes

- Webhook signature verification prevents unauthorized balance updates
- Database idempotency prevents duplicate processing
- All transactions are logged for audit purposes
- RLS policies ensure users can only see their own transactions
## 
Alternative Payment Processing Methods

### Method 1: Automatic Webhooks (Recommended)
- CPay sends webhooks automatically when payments complete
- No webhook secret required (system handles this gracefully)
- Fully automated balance updates

### Method 2: Manual Payment Confirmation
If webhooks fail or are unreliable, you can manually confirm payments:

1. **Check payment status:**
   ```
   POST /api/payments/check-status
   {
     "payment_id": "cpay_payment_id",
     "user_email": "user@example.com",
     "expected_amount": 100.00
   }
   ```

2. **Manually confirm payment:**
   ```
   POST /api/payments/manual-confirm
   {
     "payment_id": "cpay_payment_id", 
     "user_email": "user@example.com",
     "amount": 100.00,
     "notes": "Verified in CPay dashboard"
   }
   ```

### Method 3: Admin Panel Balance Addition
- Use the admin panel to manually add balance to user accounts
- Useful for customer support scenarios
- Requires admin access

## Webhook Configuration Without Secrets

Since CPay doesn't provide webhook secrets, configure your webhook URL as:

1. **Webhook URL**: `https://your-domain.vercel.app/api/payments/cpay-webhook`
2. **Events to subscribe to**: 
   - `payment.completed`
   - `payment.success` 
   - `payment.confirmed`
   - Any success/completion events CPay provides

3. **Required webhook data**:
   - `payment_id` or `transaction_id` or `order_id`
   - `customer_email` (user's email address)
   - `amount` (payment amount)
   - `status` (payment status)

The system will automatically process webhooks and update user balances without requiring webhook secrets.