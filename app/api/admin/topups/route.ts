import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSB } from '@supabase/supabase-js'

export async function GET(_req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const sb = createSB(supabaseUrl, serviceKey)

    const { data, error } = await sb
      .from('topups')
      .select('id, order_id, user_id, amount, status, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ topups: data || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}


