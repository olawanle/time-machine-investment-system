"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle, DollarSign } from 'lucide-react'

interface ManualBalanceUpdateProps {
  user: any
  onUserUpdate: (user: any) => void
}

export function ManualBalanceUpdate({ user, onUserUpdate }: ManualBalanceUpdateProps) {
  const [sessionId, setSessionId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleManualUpdate = async () => {
    if (!sessionId) {
      setError('Please enter a Stripe session ID')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/payments/manual-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: user.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update balance')
      }

      setSuccess(result.message)
      
      // Update user balance in UI
      const updatedUser = {
        ...user,
        balance: result.new_balance
      }
      onUserUpdate(updatedUser)
      
      setSessionId('')
    } catch (err: any) {
      setError(err.message || 'Failed to update balance')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-yellow-600" />
          Manual Balance Update (Testing)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">Stripe Webhook Issue?</h4>
              <p className="text-sm text-yellow-700">
                If your Stripe payment completed but your balance didn't update automatically, 
                you can manually process it here using the session ID.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Stripe Session ID
            </label>
            <Input
              type="text"
              placeholder="cs_test_..."
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="bg-background border-border"
            />
            <p className="text-xs text-muted-foreground mt-1">
              You can find this in your Stripe dashboard or payment success URL
            </p>
          </div>

          {error && (
            <div className="text-sm text-destructive flex items-center gap-2 bg-red-50 p-3 rounded-lg border border-red-200">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-600 flex items-center gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          )}

          <Button 
            onClick={handleManualUpdate}
            disabled={loading || !sessionId}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
          >
            {loading ? 'Processing...' : 'Update Balance Manually'}
          </Button>

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>⚠️ Only use this if your Stripe payment succeeded but balance didn't update</p>
            <p>🔒 This will only work for payments made with your account</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}