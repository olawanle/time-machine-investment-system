# Supabase Setup Instructions

## Step 1: Create .env.local file

Create a `.env.local` file in the root directory and add these environment variables:

```env
POSTGRES_URL="postgres://postgres.spovivqiknmhktztblbf:O4MTnYHjm72CWT96@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"
POSTGRES_USER="postgres"
POSTGRES_HOST="db.spovivqiknmhktztblbf.supabase.co"
SUPABASE_JWT_SECRET="/xEbyZm+vtYzPDtVWWJ/r5piU7+TxxzaSfZ0S0mtc3VbqGEplR4jVlAbNKk0tM4YbVkZWR4W0yG1PTiJZkh7bw=="
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3ZpdnFpa25taGt0enRibGJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NjMwODcsImV4cCI6MjA3NjMzOTA4N30.38Aszqh2I-ECn5Vn_gsVo_IM7oqMw-oEFH-Wmhk_V3s"
POSTGRES_PRISMA_URL="postgres://postgres.spovivqiknmhktztblbf:O4MTnYHjm72CWT96@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
POSTGRES_PASSWORD="O4MTnYHjm72CWT96"
POSTGRES_DATABASE="postgres"
SUPABASE_URL="https://spovivqiknmhktztblbf.supabase.co"
NEXT_PUBLIC_SUPABASE_URL="https://spovivqiknmhktztblbf.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3ZpdnFpa25taGt0enRibGJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc2MzA4NywiZXhwIjoyMDc2MzM5MDg3fQ.lz6FZ_BT-EpePvzkM4hP6l5VTRYwOyUHCFRrVeZQKPQ"
POSTGRES_URL_NON_POOLING="postgres://postgres.spovivqiknmhktztblbf:O4MTnYHjm72CWT96@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

## Step 2: Install Supabase packages

Run this command to install the required packages:

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

## Step 3: Run SQL Schema in Supabase

1. Go to your Supabase dashboard: https://spovivqiknmhktztblbf.supabase.co
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL script to create all tables and policies

## Step 4: Files Created

✅ `supabase-schema.sql` - Database schema with all tables
✅ `lib/supabase/client.ts` - Browser Supabase client
✅ `lib/supabase/server.ts` - Server Supabase client

## Database Tables Created

- **users** - Store user accounts and balances
- **time_machines** - Store user's time machines
- **referrals** - Track referral relationships
- **withdrawal_requests** - Manage withdrawal requests
- **purchased_machines** - Track marketplace purchases

## Next Steps

After completing the above steps, we'll need to:
1. Update the storage.ts file to use Supabase instead of localStorage
2. Update auth-form.tsx to use Supabase authentication
3. Test the integration

## Notes

- Row Level Security (RLS) is enabled on all tables
- Admin account email: `admin@chronostime.com` with referral code `ADMIN2024`
- All sensitive operations are protected by RLS policies

