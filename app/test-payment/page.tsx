"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function TestPaymentPage() {
  const [userId, setUserId] = useState('')
  const [amount, setAmount] = useState('100')
  const [sessionId, setSessionId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const simulatePayment = async () => {
    setLoading(true)
    setResult(null)

    try {
      // Simulate a Stripe webhook event
      const webhookEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: sessionId || `cs_test_${Date.now()}`,
            payment_status: 'paid',
            amount_total: parseFloat(amount) * 100, // Convert to cents
            payment_intent: `pi_test_${Date.now()}`,
            metadata: {
              user_id: userId,
              amount: amount
            }
          }
        }
      }

      const response = await fetch('/api/payments/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookEvent)
      })

      const data = await response.json()
      setResult(data)

    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const checkBalance = async () => {
    if (!userId) return

    try {
      const response = await fetch(`/api/debug/check-balance?user_id=${userId}`)
      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({ error: error.message })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Test Payment Simulator</CardTitle>
            <p className="text-slate-400 text-sm">
              Simulate a Stripe payment without actually processing a payment
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">User ID</label>
              <Input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your user ID"
                className="bg-slate-800 border-slate-700 text-white"
              />
              <p className="text-xs text-slate-500 mt-1">
                Get this from localStorage: chronostime_current_user
              </p>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Amount (USD)</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Session ID (optional)</label>
              <Input
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Auto-generated if empty"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={simulatePayment}
                disabled={loading || !userId || !amount}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                {loading ? 'Processing...' : 'Simulate Payment'}
              </Button>

              <Button
                onClick={checkBalance}
                disabled={!userId}
                variant="outline"
                className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
              >
                Check Balance
              </Button>
            </div>

            {result && (
              <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
                <p className="text-sm font-semibold text-white mb-2">Result:</p>
                <pre className="text-xs text-slate-300 overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">How to get your User ID</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="text-sm text-slate-400 space-y-2">
              <li>1. Open browser console (F12)</li>
              <li>2. Run: <code className="bg-slate-800 px-2 py-1 rounded text-cyan-400">localStorage.getItem('chronostime_current_user')</code></li>
              <li>3. Copy the ID and paste it above</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
