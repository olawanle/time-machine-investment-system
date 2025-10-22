import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function resetAllUserBalances() {
  try {
    // Reset all user balances to 0
    const { data, error } = await supabase
      .from('users')
      .update({
        balance: 0,
        claimedBalance: 0,
        totalInvested: 0,
        lastWithdrawalDate: Date.now(),
        machines: [],
        referrals: []
      })
      .neq('id', '00000000-0000-0000-0000-000000000000') // Update all users

    if (error) {
      console.error('Error resetting balances:', error)
      return { success: false, error: error.message }
    }

    console.log('Successfully reset all user balances')
    return { success: true, data }
  } catch (error) {
    console.error('Error in resetAllUserBalances:', error)
    return { success: false, error: 'Failed to reset balances' }
  }
}

export async function resetSpecificUserBalance(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        balance: 0,
        claimedBalance: 0,
        totalInvested: 0,
        lastWithdrawalDate: Date.now(),
        machines: [],
        referrals: []
      })
      .eq('id', userId)

    if (error) {
      console.error('Error resetting user balance:', error)
      return { success: false, error: error.message }
    }

    console.log('Successfully reset user balance for:', userId)
    return { success: true, data }
  } catch (error) {
    console.error('Error in resetSpecificUserBalance:', error)
    return { success: false, error: 'Failed to reset user balance' }
  }
}

