import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSB } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { userId, machineId } = await req.json()
    if (!userId || !machineId) return NextResponse.json({ error: 'userId and machineId required' }, { status: 400 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const sb = createSB(supabaseUrl, serviceKey)

    const { data: machine, error: mErr } = await sb
      .from('time_machines')
      .select('*')
      .eq('id', machineId)
      .eq('user_id', userId)
      .single()

    if (mErr || !machine) return NextResponse.json({ error: 'Machine not found' }, { status: 404 })

    const now = Date.now()
    const claimInterval = Number(machine.claim_interval_ms || 7 * 24 * 60 * 60 * 1000)
    const lastClaimed = Number(machine.last_claimed_at || 0)
    if (now - lastClaimed < claimInterval) {
      return NextResponse.json({ error: 'Not ready to claim' }, { status: 400 })
    }

    const reward = Number(machine.reward_amount || 0)

    // Update machine and user atomically best-effort
    const { error: upMErr } = await sb
      .from('time_machines')
      .update({ last_claimed_at: now })
      .eq('id', machineId)
      .eq('user_id', userId)

    if (upMErr) return NextResponse.json({ error: 'Failed to update machine' }, { status: 500 })

    const { data: userRow, error: uErr } = await sb.from('users').select('*').eq('id', userId).single()
    if (uErr || !userRow) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { error: upUErr } = await sb
      .from('users')
      .update({
        balance: Number(userRow.balance || 0) + reward,
        claimed_balance: Number(userRow.claimed_balance || 0) + reward,
      })
      .eq('id', userId)

    if (upUErr) return NextResponse.json({ error: 'Failed to credit user' }, { status: 500 })

    return NextResponse.json({ ok: true, reward })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}


