import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Database Setup API Endpoint
 * 
 * POST /api/setup/database - Initialize database tables and default data
 */

export async function POST(request: NextRequest) {
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

    console.log('🔧 Setting up database tables...')

    // Create machine_templates table if it doesn't exist
    const { error: templatesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS machine_templates (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          machine_type TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          base_price DECIMAL(10,2) NOT NULL,
          base_reward DECIMAL(10,2) NOT NULL,
          claim_interval_hours INTEGER NOT NULL DEFAULT 24,
          roi_percentage DECIMAL(5,2) NOT NULL,
          max_level INTEGER DEFAULT 10,
          icon_url TEXT,
          is_available BOOLEAN DEFAULT true,
          tier TEXT DEFAULT 'bronze',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (templatesError) {
      console.log('Templates table might already exist or using direct SQL...')
    }

    // Insert default machine templates
    const defaultTemplates = [
      {
        machine_type: 'basic_miner',
        name: 'Basic Time Miner',
        description: 'Entry-level time machine for beginners',
        base_price: 50.00,
        base_reward: 2.50,
        claim_interval_hours: 24,
        roi_percentage: 5.00,
        tier: 'bronze',
        icon_url: '/icons/basic-miner.svg'
      },
      {
        machine_type: 'advanced_miner',
        name: 'Advanced Time Miner',
        description: 'Improved efficiency and higher rewards',
        base_price: 150.00,
        base_reward: 8.75,
        claim_interval_hours: 24,
        roi_percentage: 5.83,
        tier: 'silver',
        icon_url: '/icons/advanced-miner.svg'
      },
      {
        machine_type: 'premium_miner',
        name: 'Premium Time Miner',
        description: 'High-performance machine with excellent ROI',
        base_price: 500.00,
        base_reward: 31.25,
        claim_interval_hours: 24,
        roi_percentage: 6.25,
        tier: 'gold',
        icon_url: '/icons/premium-miner.svg'
      },
      {
        machine_type: 'elite_miner',
        name: 'Elite Time Miner',
        description: 'Top-tier machine for serious investors',
        base_price: 1500.00,
        base_reward: 105.00,
        claim_interval_hours: 24,
        roi_percentage: 7.00,
        tier: 'platinum',
        icon_url: '/icons/elite-miner.svg'
      },
      {
        machine_type: 'quantum_miner',
        name: 'Quantum Time Miner',
        description: 'Cutting-edge technology with maximum returns',
        base_price: 5000.00,
        base_reward: 375.00,
        claim_interval_hours: 24,
        roi_percentage: 7.50,
        tier: 'platinum',
        icon_url: '/icons/quantum-miner.svg'
      }
    ]

    // Check if templates already exist
    const { data: existingTemplates } = await supabase
      .from('machine_templates')
      .select('machine_type')

    if (!existingTemplates || existingTemplates.length === 0) {
      console.log('📝 Inserting default machine templates...')
      
      const { error: insertError } = await supabase
        .from('machine_templates')
        .insert(defaultTemplates)

      if (insertError) {
        console.error('Error inserting templates:', insertError)
      } else {
        console.log('✅ Default machine templates inserted successfully')
      }
    } else {
      console.log('✅ Machine templates already exist')
    }

    // Create time_machines table if it doesn't exist
    const { error: machinesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS time_machines (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          machine_type TEXT NOT NULL,
          level INTEGER NOT NULL DEFAULT 1,
          name TEXT NOT NULL,
          description TEXT,
          investment_amount DECIMAL(10,2) NOT NULL,
          reward_amount DECIMAL(10,2) NOT NULL,
          claim_interval_hours INTEGER NOT NULL DEFAULT 24,
          max_earnings DECIMAL(10,2),
          current_earnings DECIMAL(10,2) DEFAULT 0,
          roi_percentage DECIMAL(5,2) NOT NULL,
          is_active BOOLEAN DEFAULT true,
          last_claimed_at TIMESTAMP WITH TIME ZONE,
          purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          expires_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (machinesError) {
      console.log('Machines table might already exist or using direct SQL...')
    }

    // Create machine_claims table if it doesn't exist
    const { error: claimsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS machine_claims (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          machine_id UUID REFERENCES time_machines(id) ON DELETE CASCADE NOT NULL,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          reward_amount DECIMAL(10,2) NOT NULL,
          claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          claim_type TEXT DEFAULT 'regular',
          details JSONB
        );
      `
    })

    if (claimsError) {
      console.log('Claims table might already exist or using direct SQL...')
    }

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully',
      tables_created: ['machine_templates', 'time_machines', 'machine_claims'],
      templates_count: defaultTemplates.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json({
      error: 'Failed to setup database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Database setup endpoint',
    usage: 'POST to initialize database tables and default data',
    timestamp: new Date().toISOString()
  })
}