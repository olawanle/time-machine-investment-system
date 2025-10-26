import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Admin route to manually create user profile
// Access via: /api/admin/create-profile?email=goconnect234@gmail.com

async function createProfile(supabase: any, email: string, recreate: boolean = false) {
  // Get auth user
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    return { error: 'Failed to list users', details: authError.message };
  }

  const authUser = users.find((u: any) => u.email === email);
  
  if (!authUser) {
    return { error: `No auth user found with email: ${email}` };
  }

  // If recreate, delete existing profile first
  if (recreate) {
    await supabase
      .from('users')
      .delete()
      .eq('email', email);
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
    return { 
      error: 'Failed to create profile', 
      details: insertError.message,
      code: insertError.code 
    };
  }

  return { 
    success: true, 
    message: 'Profile created successfully',
    profile: {
      email: profile.email,
      username: profile.username,
      referral_code: profile.referral_code
    }
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const recreate = searchParams.get('recreate') === 'true';

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

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

    const result = await createProfile(supabase, email, recreate);
    
    if (result.error) {
      return NextResponse.json(result, { status: result.code === '23505' ? 409 : 500 });
    }

    return NextResponse.json(result);

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, recreate = false } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

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

    const result = await createProfile(supabase, email, recreate);
    
    if (result.error) {
      return NextResponse.json(result, { status: result.code === '23505' ? 409 : 500 });
    }

    return NextResponse.json(result);

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}
