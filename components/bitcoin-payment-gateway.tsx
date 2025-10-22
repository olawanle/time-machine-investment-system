"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Bitcoin, 
  Copy, 
  Check, 
  Clock, 
  AlertTriangle,
  QrCode,
  ExternalLink,
  RefreshCw
} from "lucide-react"
import type { BitcoinTransaction } from "@/lib/storage"

interface BitcoinPaymentGatewayProps {
  amount: number
  onPaymentConfirmed: (transaction: BitcoinTransaction) => void
  onPaymentFailed: (error: string) => void
}

export function BitcoinPaymentGateway({ amount, onPaymentConfirmed, onPaymentFailed }: BitcoinPaymentGatewayProps) {
  const [bitcoinAddress] = useState("bc1q5r2096wsp4fs8c34yt4pwlklvfmdl7vldtyhya")
  const [copied, setCopied] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "confirmed" | "failed">("pending")
  const [transactionHash, setTransactionHash] = useState("")
  const [timeRemaining, setTimeRemaining] = useState(15 * 60) // 15 minutes
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          setPaymentStatus("failed")
          onPaymentFailed("Payment timeout - please try again")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onPaymentFailed])

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(bitcoinAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(amount.toString())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCheckPayment = async () => {
    setIsChecking(true)
    
    // Simulate checking for Bitcoin transaction
    // In a real implementation, this would check the blockchain
    setTimeout(() => {
      const hasTransaction = Math.random() > 0.7 // 30% chance of finding transaction
      
      if (hasTransaction) {
        const mockHash = "tx_" + Math.random().toString(36).substr(2, 9)
        setTransactionHash(mockHash)
        setPaymentStatus("confirmed")
        
        const transaction: BitcoinTransaction = {
          id: Math.random().toString(36).substr(2, 9),
          userId: "current_user",
          amount: amount,
          bitcoinAddress: bitcoinAddress,
          transactionHash: mockHash,
          status: "confirmed",
          createdAt: Date.now(),
          confirmedAt: Date.now()
        }
        
        onPaymentConfirmed(transaction)
      } else {
        setPaymentStatus("pending")
      }
      
      setIsChecking(false)
    }, 2000)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-success/20 text-success border-success/30"
      case "failed":
        return "bg-destructive/20 text-destructive border-destructive/30"
      default:
        return "bg-warning/20 text-warning border-warning/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Check className="w-5 h-5 text-success" />
      case "failed":
        return <AlertTriangle className="w-5 h-5 text-destructive" />
      default:
        return <Clock className="w-5 h-5 text-warning" />
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bitcoin className="w-5 h-5 text-warning" />
            Bitcoin Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Status */}
          <div className={`p-4 rounded-lg border ${getStatusColor(paymentStatus)}`}>
            <div className="flex items-center gap-3">
              {getStatusIcon(paymentStatus)}
              <div>
                <p className="font-semibold">
                  {paymentStatus === "confirmed" ? "Payment Confirmed!" : 
                   paymentStatus === "failed" ? "Payment Failed" : 
                   "Waiting for Payment"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {paymentStatus === "confirmed" ? "Your investment has been processed" :
                   paymentStatus === "failed" ? "Payment was not received in time" :
                   "Send Bitcoin to the address below"}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Amount to Send</label>
              <div className="flex gap-2">
                <Input
                  value={`${amount} USD`}
                  readOnly
                  className="bg-background border-border font-mono"
                />
                <Button onClick={handleCopyAmount} variant="outline" size="sm">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Bitcoin Address</label>
              <div className="flex gap-2">
                <Input
                  value={bitcoinAddress}
                  readOnly
                  className="bg-background border-border font-mono text-xs"
                />
                <Button onClick={handleCopyAddress} variant="outline" size="sm">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* QR Code Placeholder */}
          <div className="text-center">
            <div className="inline-block p-4 bg-background rounded-lg border border-border">
              <QrCode className="w-32 h-32 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Scan QR code with your Bitcoin wallet
            </p>
          </div>

          {/* Transaction Hash */}
          {transactionHash && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Transaction Hash</label>
              <div className="flex gap-2">
                <Input
                  value={transactionHash}
                  readOnly
                  className="bg-background border-border font-mono text-xs"
                />
                <Button 
                  onClick={() => window.open(`https://blockstream.info/tx/${transactionHash}`, '_blank')}
                  variant="outline" 
                  size="sm"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Timer */}
          {paymentStatus === "pending" && (
            <div className="text-center">
              <div className="text-2xl font-bold text-warning mb-2">
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-muted-foreground">
                Time remaining to complete payment
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={handleCheckPayment} 
              disabled={isChecking || paymentStatus === "confirmed"}
              className="flex-1"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check Payment"
              )}
            </Button>
            
            {paymentStatus === "failed" && (
              <Button 
                onClick={() => {
                  setPaymentStatus("pending")
                  setTimeRemaining(15 * 60)
                  setTransactionHash("")
                }}
                variant="outline"
                className="flex-1"
              >
                Try Again
              </Button>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-background p-4 rounded-lg border border-border">
            <h4 className="font-semibold text-foreground mb-2">Payment Instructions:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Copy the Bitcoin address above</li>
              <li>Open your Bitcoin wallet</li>
              <li>Send exactly ${amount} USD worth of Bitcoin to the address</li>
              <li>Wait for confirmation (usually 10-30 minutes)</li>
              <li>Click "Check Payment" to verify</li>
            </ol>
          </div>

          {/* Warning */}
          <div className="bg-warning/10 border border-warning/30 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warning">Important:</p>
                <p className="text-xs text-muted-foreground">
                  Only send Bitcoin to this address. Sending other cryptocurrencies will result in loss of funds.
                  The payment must be completed within the time limit shown above.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
