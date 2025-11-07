import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('=== SIMPLE WEBHOOK TEST CALLED ===')
  console.log('Time:', new Date().toISOString())
  console.log('Headers:', Object.fromEntries(request.headers.entries()))
  
  try {
    const body = await request.text()
    console.log('Body length:', body.length)
    console.log('Body preview:', body.substring(0, 200))
    
    return NextResponse.json({ 
      received: true, 
      timestamp: new Date().toISOString(),
      message: 'Webhook test received successfully'
    })
  } catch (error) {
    console.error('Webhook test error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Simple webhook test endpoint is working',
    timestamp: new Date().toISOString()
  })
}