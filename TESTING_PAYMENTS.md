# Testing Payments Without Webhook Configuration

## The Problem

You're using **test API keys** but the **webhook secret is from production**. This causes webhook signature verification to fail, so payments don't update the balance.

## Quick Solution: Use Test Payment Simulator

After redeployment, visit: **`https://your-site.com/test-payment`**

### Steps:

1. **Get your User ID:**
   - Open browser console (F12)
   - Run: `localStorage.getItem('chronostime_current_user')`
   - Copy the ID

2. **Simulate a payment:**
   - Go to `/test-payment`
   - Paste your User ID
   - Enter amount (e.g., 100)
   - Click "Simulate Payment"

3. **Check balance:**
   - Click "Check Balance" to see updated balance
   - Or refresh your dashboard

This bypasses Stripe entirely and directly updates your database.

## Why Webhook Isn't Working

### Current Setup:
```
STRIPE_SECRET_KEY=sk_test_... (TEST)
STRIPE_PUBLISHABLE_KEY=pk_test_... (TEST)
STRIPE_WEBHOOK_SECRET=whsec_... (PRODUCTION)
```

### The Issue:
- Test payments send webhooks with **test signatures**
- Your webhook secret expects **production signatures**
- Signature verification fails
- Balance doesn't update

## Proper Solutions

### Option 1: Use Stripe CLI (Recommended for Development)

1. **Install Stripe CLI:**
   ```bash
   # Windows (using Scoop)
   scoop install stripe
   
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe:**
   ```bash
   stripe login
   ```

3. **Forward webhooks to local:**
   ```bash
   stripe listen --forward-to localhost:3000/api/payments/stripe-webhook
   ```

4. **Copy the webhook secret:**
   - CLI will show: `whsec_...`
   - Update `.env.local` with this secret

5. **Test payments:**
   - Make a test payment
   - Webhook will be forwarded to your local server
   - Balance will update

### Option 2: Get Test Webhook Secret from Stripe Dashboard

1. **Go to Stripe Dashboard:**
   - https://dashboard.stripe.com/test/webhooks

2. **Create a webhook endpoint:**
   - Click "Add endpoint"
   - URL: `https://your-site.com/api/payments/stripe-webhook`
   - Events: Select `checkout.session.completed`

3. **Get the signing secret:**
   - Click on your webhook
   - Reveal the "Signing secret"
   - Copy it (starts with `whsec_`)

4. **Update environment variable:**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_TEST_SECRET_HERE
   ```

5. **Redeploy your site**

### Option 3: Use Test Webhook Endpoint (Current Solution)

The test webhook endpoint (`/api/payments/test-webhook`) bypasses signature verification.

**To use it:**

1. **In Stripe Dashboard**, update your webhook URL to:
   ```
   https://your-site.com/api/payments/test-webhook
   ```

2. **Make a test payment**

3. **Webhook will process without signature verification**

⚠️ **WARNING:** Never use this in production! It's insecure.

## Checking if Webhook Worked

### Method 1: Check Database
Visit: `https://your-site.com/api/debug/check-balance?user_id=YOUR_USER_ID`

### Method 2: Check Stripe Dashboard
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click on your webhook
3. View recent events
4. Check if they show 200 (success) or error

### Method 3: Check Logs
Visit: `https://your-site.com/api/debug/webhook-logs`

## Theme Issue

The dashboard is showing the old theme because **your site hasn't been redeployed** with the new code.

### To fix:
1. **Redeploy your application** (Vercel/Netlify should auto-deploy from GitHub)
2. **Clear browser cache** (Ctrl+Shift+R)
3. **Check deployment logs** to ensure it deployed successfully

The correct theme uses `APIDashboard` component with `ModernSidebar` and dark blue/purple gradient background.

## Summary

**For immediate testing:**
- Use `/test-payment` page to simulate payments
- This updates balance without needing Stripe webhooks

**For proper setup:**
- Use Stripe CLI for local development
- Get test webhook secret from Stripe Dashboard for deployed site
- Never use production webhook secret with test keys

---

**Quick Test:** After redeployment, go to `/test-payment` and simulate a payment to verify balance updates work!
