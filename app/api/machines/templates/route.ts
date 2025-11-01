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
      
      // If table doesn't exist, return default templates
      if (templatesError.message?.includes('relation') || templatesError.message?.includes('does not exist')) {
        console.log('⚠️ Machine templates table does not exist yet, returning default templates')
        
        const defaultTemplates = [
          {
            id: '1',
            machine_type: 'basic_miner',
            name: 'Basic Time Miner',
            description: 'Entry-level time machine for beginners',
            base_price: 50.00,
            base_reward: 2.50,
            claim_interval_hours: 24,
            roi_percentage: 5.00,
            max_level: 10,
            icon_url: '/icons/basic-miner.svg',
            is_available: true,
            tier: 'bronze',
            metrics: {
              daily_reward: 2.50,
              weekly_reward: 17.50,
              monthly_reward: 75.00,
              yearly_reward: 912.50,
              payback_days: 20,
              claim_frequency: 'Every 24 hours'
            }
          },
          {
            id: '2',
            machine_type: 'advanced_miner',
            name: 'Advanced Time Miner',
            description: 'Improved efficiency and higher rewards',
            base_price: 150.00,
            base_reward: 8.75,
            claim_interval_hours: 24,
            roi_percentage: 5.83,
            max_level: 10,
            icon_url: '/icons/advanced-miner.svg',
            is_available: true,
            tier: 'silver',
            metrics: {
              daily_reward: 8.75,
              weekly_reward: 61.25,
              monthly_reward: 262.50,
              yearly_reward: 3193.75,
              payback_days: 17,
              claim_frequency: 'Every 24 hours'
            }
          }
        ]
        
        return NextResponse.json({
          success: true,
          data: {
            templates: defaultTemplates,
            total_templates: defaultTemplates.length
          }
        })
      }
      
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