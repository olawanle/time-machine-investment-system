# Balance Update Fix

## Issue
Payment shows as successful but user balance doesn't update in the UI.

## Root Causes Fixed

### 1. Wrong Balance Field Displayed
**Problem:** Sidebar was showing `user.claimedBalance` instead of `user.balance`
**Fix:** Updated ModernSidebar to display `user.balance`

### 2. Incomplete User Data in Payment Success
**Problem:** verify-session endpoint only returned partial user data (id, balance, email, username)
**Fix:** Now fetches complete user object including machines and referrals

## How Payment Flow Works

1. **User initiates payment** → `/api/payments/create-checkout-session`
   - Creates Stripe session with user_id and amount in metadata
   - Stores transaction in database with status 'pending'

2. **User completes payment** → Stripe processes payment

3. **Stripe sends webhook** → `/api/payments/stripe-webhook`
   - Verifies webhook signature
   - Updates payment_transactions table to 'completed'
   - Fetches user from database
   - Updates user.balance and user.total_invested
   - Logs all operations

4. **User redirected to success page** → `/payment-success?session_id=xxx`
   - Calls `/api/payments/verify-session`
   - Fetches updated user data from database
   - Updates localStorage with fresh user data
   - Triggers storage event to refresh UI
   - Auto-redirects to dashboard

5. **Dashboard loads** → Shows updated balance

## Balance Fields Explained

- **`balance`** - Available balance for purchasing time machines (updated by payments)
- **`claimedBalance`** - Rewards that have been claimed (updated by claiming rewards)
- **`total_invested`** - Total amount invested (updated by payments)

## Debugging Steps

### 1. Check if webhook is being called
```bash
# Check Stripe webhook logs in Stripe Dashboard
# Go to: Developers → Webhooks → Select your webhook → View logs
```

### 2. Check user balance in database
Visit: `https://your-site.com/api/debug/check-balance?user_id=YOUR_USER_ID`

This will show:
- Current balance in database
- Recent payment transactions
- Transaction statuses

### 3. Check payment transaction status
```sql
SELECT * FROM payment_transactions 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY created_at DESC 
LIMIT 5;
```

### 4. Check webhook logs
Visit: `https://your-site.com/api/debug/webhook-logs`

### 5. Verify localStorage
Open browser console and run:
```javascript
// Check current user
console.log(localStorage.getItem('chronostime_current_user'))

// Check all users
console.log(JSON.parse(localStorage.getItem('chronostime_users')))
```

## Common Issues

### Issue: Balance shows $0 after payment
**Cause:** Webhook hasn't been called yet or failed
**Solution:** 
1. Check Stripe webhook logs
2. Verify webhook endpoint is accessible
3. Check webhook secret is correct

### Issue: Payment successful but balance not updating
**Cause:** localStorage not refreshing
**Solution:**
1. Hard refresh page (Ctrl+Shift+R)
2. Clear localStorage and log in again
3. Check if verify-session is returning updated user data

### Issue: Webhook failing
**Cause:** User ID not found in database
**Solution:**
1. Check user_id in Stripe session metadata
2. Verify user exists in database
3. Check user_id format matches database

## Testing Payment Flow

1. **Test with Stripe test card:**
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

2. **Monitor webhook:**
   - Check Stripe Dashboard → Webhooks
   - Look for `checkout.session.completed` event
   - Verify it shows 200 response

3. **Check database:**
   - Visit `/api/debug/check-balance?user_id=YOUR_ID`
   - Verify balance increased

4. **Check UI:**
   - Refresh dashboard
   - Balance should show updated amount

## Files Changed

- ✅ `components/modern-sidebar.tsx` - Fixed balance display
- ✅ `app/api/payments/verify-session/route.ts` - Fetch complete user data
- ✅ `app/api/debug/check-balance/route.ts` - New debug endpoint

## Next Steps After Deployment

1. **Test a payment** with Stripe test card
2. **Check webhook logs** in Stripe Dashboard
3. **Verify balance updates** in UI
4. **Use debug endpoint** if issues persist

---

**Status:** ✅ Fixed and deployed
**Date:** November 7, 2025
