# 🌐 Setting Up checkouts.chronostime.fund Subdomain

## 🚨 Current Issue
The URL `https://checkouts.chronostime.fund/checkout/acb26bab-0d68-4ffa-b9f9-5ad577762fc7` returns **404 Not Found** because the subdomain is not configured.

## 🔧 Solutions (Choose One)

### **Option 1: Set Up Subdomain Redirect (Recommended)**

If you want to keep using your own domain for branding, set up a redirect:

#### **DNS Configuration:**
1. **Go to your domain registrar** (where you bought chronostime.fund)
2. **Add a CNAME record**:
   - **Name**: `checkouts`
   - **Value**: `checkouts.cpay.world`
   - **TTL**: 300 (or default)

#### **Alternative - URL Redirect:**
1. **In your domain control panel**
2. **Set up URL forwarding**:
   - **From**: `checkouts.chronostime.fund/*`
   - **To**: `https://checkouts.cpay.world/*`
   - **Type**: 301 Permanent Redirect

### **Option 2: Use CPay's Domain Directly**

Update your code to use CPay's working domain:

```javascript
// Change from:
href="https://checkouts.chronostime.fund/checkout/acb26bab-0d68-4ffa-b9f9-5ad577762fc7"

// To:
href="https://checkouts.cpay.world/checkout/acb26bab-0d68-4ffa-b9f9-5ad577762fc7"
```

### **Option 3: Create Your Own Payment Page**

Set up `checkouts.chronostime.fund` as a separate website that:
1. **Hosts your own payment form**
2. **Integrates with CPay's API**
3. **Provides custom branding**

## 🚀 Quick Fix (Option 1 - DNS Redirect)

### **Step 1: DNS Setup**
1. **Login to your domain registrar** (GoDaddy, Namecheap, Cloudflare, etc.)
2. **Go to DNS Management**
3. **Add CNAME record**:
   ```
   Type: CNAME
   Name: checkouts
   Value: checkouts.cpay.world
   TTL: 300
   ```

### **Step 2: Wait for Propagation**
- **DNS changes take 5-30 minutes** to propagate
- **Test the URL** after waiting: `https://checkouts.chronostime.fund/checkout/acb26bab-0d68-4ffa-b9f9-5ad577762fc7`

### **Step 3: Verify**
- **URL should now work** and redirect to CPay's checkout
- **Users see your domain** in the address bar initially
- **Payment processing** works normally

## 🔍 Troubleshooting

### **If DNS doesn't work:**
1. **Check DNS propagation**: Use tools like `whatsmydns.net`
2. **Verify CNAME record**: Make sure it points to `checkouts.cpay.world`
3. **Clear browser cache**: Hard refresh the page
4. **Wait longer**: DNS can take up to 24 hours in rare cases

### **If you can't access DNS:**
1. **Contact your domain registrar** for help
2. **Use Option 2** (CPay's domain directly) as temporary fix
3. **Ask your web developer** to help with DNS setup

## 📱 Testing After Setup

### **Test Steps:**
1. **Visit**: `https://checkouts.chronostime.fund/checkout/acb26bab-0d68-4ffa-b9f9-5ad577762fc7`
2. **Should show**: CPay checkout page (not 404)
3. **Test payment flow**: Complete a small test payment
4. **Verify callback**: Check if balance updates correctly

## 🎯 Recommended Approach

**I recommend Option 1 (DNS Redirect)** because:
- ✅ **Keeps your branding** - Users see your domain
- ✅ **Simple setup** - Just one DNS record
- ✅ **No code changes** - Your current code works
- ✅ **Professional appearance** - Custom domain looks better
- ✅ **Easy maintenance** - No ongoing technical work

## 🆘 Immediate Workaround

If you need payments working RIGHT NOW while setting up DNS:

1. **Temporarily use CPay's domain** in your code
2. **Set up the DNS redirect** in parallel
3. **Switch back to your domain** once DNS is working

Would you like me to help you with any of these options?