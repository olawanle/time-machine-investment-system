# Runtime Error Debug Guide

## Error Analysis

The error `TypeError: e[o] is not a function` suggests a module loading issue in Next.js. This typically happens when:

1. **Dynamic imports fail** - Fixed by converting to static imports
2. **Circular dependencies** - Need to check import chains
3. **SSR/Client mismatch** - Fixed by using standard Supabase client
4. **Build cache issues** - Need to clear Next.js cache

## Fixes Applied

### 1. ✅ Converted Dynamic Imports to Static
- Fixed `app/page.tsx` - now uses static import for enhancedStorage
- Fixed `components/time-machine-marketplace.tsx` - static import for enhancedStorage  
- Fixed `components/machine-claiming.tsx` - static import for storage
- Fixed `components/machine-portfolio.tsx` - static import for storage
- Fixed `components/referral-system.tsx` - static import for storage

### 2. ✅ Fixed Supabase Client
- Replaced `@supabase/ssr` with standard `@supabase/supabase-js`
- Removed SSR-specific features that might cause runtime issues
- Added proper client configuration

### 3. 🔄 Next Steps to Try

If the error persists, try these steps in order:

#### Step 1: Clear Build Cache
```bash
rm -rf .next
npm run build
npm run start
```

#### Step 2: Check for Circular Dependencies
Run this command to detect circular imports:
```bash
npx madge --circular --extensions ts,tsx .
```

#### Step 3: Simplify Imports (if needed)
If the error continues, we may need to:
- Remove unused imports from enhanced-storage.ts
- Simplify the storage service architecture
- Use only localStorage temporarily

#### Step 4: Check Package Versions
Ensure compatible versions:
```bash
npm ls @supabase/supabase-js
npm ls next
npm ls react
```

## Test Commands

### 1. Test Basic App
```bash
npm run dev
```

### 2. Test Production Build
```bash
npm run build
npm run start
```

### 3. Test Specific Components
Create a minimal test page to isolate the issue.

## Common Solutions

1. **Clear node_modules and reinstall**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Update Next.js**:
   ```bash
   npm update next
   ```

3. **Check for conflicting dependencies**:
   ```bash
   npm audit
   ```

## If Error Persists

The error might be in a specific component or service. We can:
1. Temporarily disable enhanced storage
2. Use only localStorage for testing
3. Gradually re-enable features to isolate the issue

Let me know if the error continues after clearing the build cache!