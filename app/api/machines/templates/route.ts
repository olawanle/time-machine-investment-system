import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Machine Templates API Endpoint
 * 
 * GET /api/machines/templates - Get available machine types for purchase
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get all available machine templates
    const { data: templates, error: templatesError } = await supabase
      .from('machine_templates')
      .select('*')
      .eq('is_available', true)
      .order('base_price', { ascending: true })

    if (templatesError) {
      console.error('Error fetching machine templates:', templatesError)
      return NextResponse.json({
        error: 'Failed to fetch machine templates'
      }, { status: 500 })
    }

    // Calculate additional metrics for each template
    const templatesWithMetrics = templates?.map(template => {
      const dailyReward = (template.base_price * template.roi_percentage) / 100 / 365 * (template.claim_interval_hours / 24)
      const weeklyReward = dailyReward * 7
      const monthlyReward = dailyReward * 30
      const yearlyReward = dailyReward * 365
      const paybackDays = template.base_price / dailyReward

      return {
        ...template,
        metrics: {
          daily_reward: parseFloat(dailyReward.toFixed(2)),
          weekly_reward: parseFloat(weeklyReward.toFixed(2)),
          monthly_reward: parseFloat(monthlyReward.toFixed(2)),
          yearly_reward: parseFloat(yearlyReward.toFixed(2)),
          payback_days: Math.ceil(paybackDays),
          claim_frequency: `Every ${template.claim_interval_hours} hours`
        }
      }
    }) || []

    return NextResponse.json({
      success: true,
      data: {
        templates: templatesWithMetrics,
        total_templates: templatesWithMetrics.length
      }
    })

  } catch (error) {
    console.error('Machine templates API error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}