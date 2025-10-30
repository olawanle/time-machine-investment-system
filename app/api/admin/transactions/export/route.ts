import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Export Transactions Data Endpoint
 * Exports transaction data as CSV for admin use
 */

export async function GET(request: NextRequest) {
  try {
    // Create admin client
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

    // Fetch all transactions
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        id,
        user_id,
        type,
        amount,
        description,
        status,
        created_at,
        users!inner(email, name)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error)
      // If transactions table doesn't exist, try payment_transactions
      const { data: paymentTransactions, error: paymentError } = await supabase
        .from('payment_transactions')
        .select(`
          id,
          user_id,
          amount,
          currency,
          status,
          processed_at,
          users!inner(email, name)
        `)
        .order('processed_at', { ascending: false })

      if (paymentError) {
        return NextResponse.json({ error: 'No transaction data available' }, { status: 404 })
      }

      // Convert payment transactions to CSV
      const csvHeaders = [
        'ID',
        'User Email',
        'User Name',
        'Amount',
        'Currency',
        'Status',
        'Date'
      ].join(',')

      const csvRows = paymentTransactions?.map(tx => [
        tx.id,
        tx.users?.email || '',
        tx.users?.name || '',
        tx.amount || 0,
        tx.currency || 'USD',
        tx.status || '',
        new Date(tx.processed_at).toISOString()
      ].map(field => `"${field}"`).join(',')) || []

      const csvContent = [csvHeaders, ...csvRows].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="payment-transactions-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    // Convert regular transactions to CSV
    const csvHeaders = [
      'ID',
      'User Email',
      'User Name', 
      'Type',
      'Amount',
      'Description',
      'Status',
      'Date'
    ].join(',')

    const csvRows = transactions?.map(tx => [
      tx.id,
      tx.users?.email || '',
      tx.users?.name || '',
      tx.type || '',
      tx.amount || 0,
      tx.description || '',
      tx.status || '',
      new Date(tx.created_at).toISOString()
    ].map(field => `"${field}"`).join(',')) || []

    const csvContent = [csvHeaders, ...csvRows].join('\n')

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="transactions-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Export transactions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}