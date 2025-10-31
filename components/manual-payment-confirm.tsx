"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  User
} from "lucide-react"

interface ManualPaymentConfirmProps {
  user: any
  onUserUpdate: (user: any) => void
}

export function ManualPaymentConfirm({ user, onUserUpdate }: ManualPaymentConfirmProps) {
  const [paymentId, setPaymentId] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleManualConfirm = async () => {
    try {
      setError("")
      setSuccess("")
      setLoading(true)

      if (!paymentId || !amount) {
        setError("Please enter both payment ID and amount")
        return
      }

      const numAmount = parseFloat(amount)
      if (isNaN(numAmount) || numAmount <= 0) {
        setError("Please enter a valid amount")
        return
      }

      const response = await fetch('/api/payments/manual-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: paymentId,
          user_email: user.email,
          amount: numAmount,
          notes: `Manual confirmation by user ${user.email}`
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to confirm payment')
      }

      setSuccess(`Payment confirmed! $${numAmount} has been added to your balance.`)
      
      // Update user balance in UI
      const updatedUser = { 
        ...user, 
        balance: result.new_balance || (user.balance + numAmount) 
      }
      onUserUpdate(updatedUser)

      // Clear form
      setPaymentId("")
      setAmount("")

    } catch (err: any) {
      setError(err.message || 'Failed to confirm payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-yellow-600" />
          Manual Payment Confirmation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">Payment Not Updating Automatically?</h4>
              <p className="text-sm text-yellow-700">
                If you completed a payment but your balance hasn't updated after 10 minutes, 
                you can manually confirm it here using your payment details.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Payment ID / Transaction ID
            </label>
            <Input
              type="text"
              placeholder="Enter your payment ID from CPay"
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
              className="bg-background border-border"
            />
            <p className="text-xs text-muted-foreground mt-1">
              You can find this in your CPay payment confirmation email or receipt
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Amount (USD)
            </label>
            <Input
              type="number"
              min="1"
              step="0.01"
              placeholder="Enter the amount you paid"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          <div className="bg-background/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Account Details</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>Email: {user.email}</div>
              <div>Current Balance: ${(user.balance || 0).toLocaleString()}</div>
            </div>
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
            onClick={handleManualConfirm}
            disabled={loading || !paymentId || !amount}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            {loading ? 'Confirming Payment...' : 'Confirm Payment'}
          </Button>

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>⚠️ Only use this if your payment was successful but balance didn't update</p>
            <p>🔒 We verify all payments before crediting your account</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}