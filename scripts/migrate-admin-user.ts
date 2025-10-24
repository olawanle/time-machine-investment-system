// Migration script to add existing admin user to Supabase Auth
// Run with: npx tsx scripts/migrate-admin-user.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function migrateAdminUser() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log('🔧 Migrating admin user to Supabase Auth...')

  // Create admin user in Supabase Auth
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@chronostime.com',
    password: 'admin123',
    email_confirm: true,
    user_metadata: {
      username: 'Administrator'
    }
  })

  if (error) {
    console.error('❌ Error creating auth user:', error.message)
    return
  }

  console.log('✅ Admin user created in Supabase Auth')
  console.log('User ID:', data.user.id)

  // Update the existing database record with the new auth user ID
  const { error: updateError } = await supabase
    .from('users')
    .update({ id: data.user.id })
    .eq('email', 'admin@chronostime.com')

  if (updateError) {
    console.error('❌ Error updating database record:', updateError.message)
    return
  }

  console.log('✅ Database record updated')
  console.log('\n🎉 Migration complete! You can now log in with:')
  console.log('   Email: admin@chronostime.com')
  console.log('   Password: admin123')
}

migrateAdminUser()
