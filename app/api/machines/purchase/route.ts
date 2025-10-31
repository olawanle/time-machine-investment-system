import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSB } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, machine, quantity } = body || {}

    if (!userId || !machine || !quantity || quantity < 1) {
      return NextResponse.json({ error: 'userId, machine, quantity required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const sb = createSB(supabaseUrl, serviceKey)

    // Fetch user to check balance
    const { data: user, error: uerr } = await sb.from('users').select('*').eq('id', userId).single()
    if (uerr || !user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const totalCost = machine.price * quantity
    if (Number(user.balance || 0) < totalCost) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    const now = Date.now()
    const rows = Array.from({ length: quantity }).map((_, idx) => ({
      user_id: userId,
      level: machine.id,
      name: machine.name,
      description: machine.description || '',
      unlocked_at: now,
      last_claimed_at: 0,
      is_active: true,
      reward_amount: machine.weeklyReturn,
      claim_interval_ms: 7 * 24 * 60 * 60 * 1000,
      icon: '⏰',
    }))

    const { error: insErr } = await sb.from('time_machines').insert(rows)
    if (insErr) return NextResponse.json({ error: 'Failed to create machines' }, { status: 500 })

    const { error: upErr } = await sb
      .from('users')
      .update({ balance: Number(user.balance) - totalCost, total_invested: Number(user.total_invested || 0) + totalCost })
      .eq('id', userId)

    if (upErr) return NextResponse.json({ error: 'Failed to update user balance' }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}


