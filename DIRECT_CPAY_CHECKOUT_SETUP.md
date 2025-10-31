# 🚀 Direct CPay Checkout Setup Guide

## Overview
This setup uses CPay's direct checkout link instead of API-based invoice creation. Users click a button that opens the CPay checkout page, complete their payment, and return to see their balance updated automatically.

## How It Works

### User Flow:
1. **User enters amount** on balance topup page
2. **Clicks "Buy with Crypto"** → Opens CPay checkout in new tab
3. **Completes payment** on CPay checkout page
4. **Returns to original tab** → Sees payment processing message
5. **Balance updates automatically** via polling system
6. **If needed** → Can use manual confirmation

### Technical Flow:
1. **Direct checkout link** opens CPay payment page
2. **Polling system** checks for recent payments every 8 seconds
3. **CPay callback** processes payment and updates balance
4. **Manual confirmation** available as fallback

## Files Modified/Created

### Modified:
- `components/balance-topup.tsx` - Updated to use direct checkout link
- Removed dependency on `/api/cpay/create-invoice`

### Created:
- `app/api/payments/check-recent/route.ts` - Checks for recent payments
- `app/payment-success/page.tsx` - Payment confirmation page
- `components/manual-payment-confirm.tsx` - Manual confirmation UI

## CPay Configuration Required

### 1. Callback URL Setup
In your CPay dashboard:
1. **Login to CPay Dashboard** at https://cpay.world
2. **Go to Settings** → **Me** tab
3. **Set Callback URI**: `https://your-domain.vercel.app/api/payments/cpay-callback`
4. **Save settings**

### 2. Checkout Link
The direct checkout link is hardcoded in the component:
```
https://checkouts.cpay.world/checkout/acb26bab-0d68-4ffa-b9f9-5ad577762fc7
```

## Environment Variables

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# CPay (optional - for API verification)
CPAY_API_KEY=your_cpay_api_key
CPAY_BASE_URL=https://api.cpay.com

# Optional admin security
MANUAL_PAYMENT_ADMIN_KEY=your_secure_admin_key
```

## Database Requirements

Ensure you have the `payment_transactions` table:

```sql
CREATE TABLE payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL,
  raw_webhook_data JSONB,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Testing the Setup

### Test 1: Direct Checkout Flow
1. Go to balance topup page
2. Enter amount (e.g., $10)
3. Click "Buy with Crypto"
4. ✅ CPay checkout should open in new tab
5. Complete test payment
6. ✅ Return to original tab - should see polling message
7. ✅ Balance should update automatically

### Test 2: Manual Confirmation
1. If automatic doesn't work, scroll to manual confirmation
2. Enter payment ID from CPay receipt
3. Enter amount paid
4. Click "Confirm Payment"
5. ✅ Balance should update immediately

### Test 3: Callback Processing
1. Check server logs for callback processing
2. Visit `/api/payments/cpay-callback?test=true`
3. ✅ Should redirect to dashboard

## API Endpoints

### `/api/payments/check-recent` (POST)
Checks for recent payments for a user
```json
{
  "user_id": "user123",
  "user_email": "user@example.com", 
  "expected_amount": 100.00,
  "since_timestamp": 1234567890000
}
```

### `/api/payments/cpay-callback` (GET/POST)
Processes CPay payment callbacks
- Updates user balance
- Records transaction
- Redirects to dashboard

### `/api/payments/manual-confirm` (POST)
Manual payment confirmation
```json
{
  "payment_id": "cpay_payment_id",
  "user_email": "user@example.com",
  "amount": 100.00
}
```

## Advantages of Direct Checkout

### ✅ Pros:
- **Simple setup** - No API integration needed
- **Reliable** - Direct CPay checkout is stable
- **User-friendly** - Familiar checkout experience
- **Automatic polling** - Balance updates without user action
- **Manual fallback** - Users can confirm payments themselves

### ⚠️ Considerations:
- **Fixed checkout link** - Same link for all users/amounts
- **Polling dependency** - Relies on callback or manual confirmation
- **Amount tracking** - Uses localStorage to track expected amounts

## Troubleshooting

### Payment Not Updating:
1. **Check CPay callback URL** is correctly set
2. **Verify server logs** for callback processing
3. **Use manual confirmation** as fallback
4. **Check recent transactions** in admin panel

### Polling Not Working:
1. **Check browser console** for errors
2. **Verify API endpoints** are accessible
3. **Check localStorage** for payment tracking data
4. **Use manual confirmation** instead

### Callback Issues:
1. **Verify callback URL** in CPay dashboard
2. **Check server logs** for callback errors
3. **Test callback endpoint** manually
4. **Ensure database permissions** are correct

## Success Metrics

### Before:
- ❌ Complex API integration required
- ❌ Invoice creation could fail
- ❌ Users confused by payment flow

### After:
- ✅ Simple direct checkout link
- ✅ Automatic balance updates via polling
- ✅ Manual confirmation as fallback
- ✅ User-friendly payment experience

## Next Steps

1. **Deploy the changes** to production
2. **Test with small payment** ($10-20)
3. **Monitor callback processing** in server logs
4. **Update user documentation** with new flow
5. **Train support team** on manual confirmation

---

**🎉 Direct CPay checkout is now ready with automatic balance updates!**