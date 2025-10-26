import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Admin route to manually create user profile
// Access via: /api/admin/create-profile?email=goconnect234@gmail.com

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    // Create admin client with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get auth user
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      return NextResponse.json({ error: 'Failed to list users', details: authError.message }, { status: 500 });
    }

    const authUser = users.find(u => u.email === email);
    
    if (!authUser) {
      return NextResponse.json({ error: `No auth user found with email: ${email}` }, { status: 404 });
    }

    // Generate username and referral code
    const username = email.split('@')[0];
    const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Create profile directly in database
    const { data: profile, error: insertError } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email: email,
        name: username,
        username: username,
        balance: 0,
        claimed_balance: 0,
        total_invested: 0,
        total_earned: 0,
        roi: 0,
        tier: 'bronze',
        is_admin: false,
        referral_code: referralCode,
        referred_by: null,
        last_withdrawal_date: 0,
        is_suspended: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ 
        error: 'Failed to create profile', 
        details: insertError.message,
        code: insertError.code 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profile created successfully',
      profile: {
        email: profile.email,
        username: profile.username,
        referral_code: profile.referral_code
      }
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}
