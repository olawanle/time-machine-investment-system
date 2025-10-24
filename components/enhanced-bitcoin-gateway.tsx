"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AsyncWrapper } from "@/components/ui/async-wrapper"
import { useToast, useSuccessToast, useErrorToast } from "@/components/ui/toast-system"
import { 
  Bitcoin, 
  Copy, 
  Check, 
  Clock, 
  AlertTriangle,
  QrCode,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  XCircle
} from "lucide-react"
import { cryptoPaymentService, formatBitcoinAmount, type PaymentRequest } from "@/lib/crypto-payment-service"
import type { BitcoinTransaction } from "@/lib/storage"

interface EnhancedBitcoinGatewayProps {
  userId: string
  amount: number
  onPaymentConfirmed: (transaction: BitcoinTransaction) => void
  onPaymentFailed: (error: string) => void
  onCancel?: () => void
}

export function EnhancedBitcoinGateway({ 
  userId, 
  amount, 
  onPaymentConfirmed, 
  onPaymentFailed,
  onCancel 
}: EnhancedBitcoinGatewayProps) {
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<'address' | 'amount' | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isChecking, setIsChecking] = useState(false)
  const [confirmations, setConfirmations] = useState(0)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [bitcoinPrice, setBitcoinPrice] = useState(0)

  const successToast = useSuccessToast()
  const errorToast = useErrorToast()

  // Initialize payment request
  useEffect(() => {
    const initializePayment = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get current Bitcoin price
        const price = await cryptoPaymentService.getBitcoinPrice()
        setBitcoinPrice(price)

        // Create payment request
        const request = await cryptoPaymentService.createPaymentRequest(userId, amount, 15)
        setPaymentRequest(request)
        setTimeRemaining(Math.floor((request.expiresAt - Date.now()) / 1000))

        console.log('Payment request initialized:', request)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment'
        setError(errorMessage)
        onPaymentFailed(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    initializePayment()
  }, [userId, amount, onPaymentFailed])

  // Timer countdown
  useEffect(() => {
    if (!paymentRequest || paymentRequest.status !== 'pending') return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const remaining = Math.floor((paymentRequest.expiresAt - Date.now()) / 1000)
        if (remaining <= 0) {
          setError('Payment request expired')
          onPaymentFailed('Payment timeout - please try again')
          return 0
        }
        return remaining
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [paymentRequest, onPaymentFailed])

  // Auto-check for payments
  useEffect(() => {
    if (!paymentRequest || paymentRequest.status !== 'pending') return

    const checkInterval = setInterval(async () => {
      await checkPaymentStatus()
    }, 30000) // Check every 30 seconds

    return () => clearInterval(checkInterval)
  }, [paymentRequest])

  const checkPaymentStatus = useCallback(async () => {
    if (!paymentRequest || isChecking) return

    try {
      setIsChecking(true)
      const result = await cryptoPaymentService.verifyPayment(paymentRequest.id)

      if (result.success && result.transaction) {
        setTransactionHash(result.transaction.hash)
        setConfirmations(result.confirmations)

        if (result.isComplete) {
          // Payment confirmed!
          const bitcoinTransaction: BitcoinTransaction = {
            id: paymentRequest.id,
            userId: paymentRequest.userId,
            amount: paymentRequest.amount,
            bitcoinAddress: paymentRequest.address,
            transactionHash: result.transaction.hash,
            status: 'confirmed',
            createdAt: paymentRequest.createdAt,
            confirmedAt: Date.now()
          }

          successToast('Payment confirmed! Your investment is being processed.')
          onPaymentConfirmed(bitcoinTransaction)
        } else {
          // Payment found but not enough confirmations
          successToast(`Payment detected! Waiting for confirmations (${result.confirmations}/${paymentRequest.requiredConfirmations})`)
        }
      } else if (result.error) {
        setError(result.error)
        if (result.isComplete) {
          onPaymentFailed(result.error)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check payment'
      errorToast(errorMessage)
    } finally {
      setIsChecking(false)
    }
  }, [paymentRequest, isChecking, onPaymentConfirmed, onPaymentFailed, successToast, errorToast])

  const handleCopy = (type: 'address' | 'amount', value: string) => {
    navigator.clipboard.writeText(value)
    setCopied(type)
    successToast(`${type === 'address' ? 'Address' : 'Amount'} copied to clipboard`)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleManualCheck = () => {
    checkPaymentStatus()
  }

  const handleCancel = () => {
    if (paymentRequest) {
      cryptoPaymentService.cancelPayment(paymentRequest.id)
    }
    onCancel?.()
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getStatusDisplay = () => {
    if (!paymentRequest) return null

    switch (paymentRequest.status) {
      case 'confirmed':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-400" />,
          title: 'Payment Confirmed!',
          description: 'Your investment has been processed successfully.',
          color: 'bg-green-500/10 border-green-500/20 text-green-100'
        }
      case 'expired':
        return {
          icon: <XCircle className="w-5 h-5 text-red-400" />,
          title: 'Payment Expired',
          description: 'The payment window has closed. Please create a new payment.',
          color: 'bg-red-500/10 border-red-500/20 text-red-100'
        }
      case 'failed':
        return {
          icon: <XCircle className="w-5 h-5 text-red-400" />,
          title: 'Payment Failed',
          description: error || 'Payment could not be processed.',
          color: 'bg-red-500/10 border-red-500/20 text-red-100'
        }
      default:
        if (transactionHash && confirmations > 0) {
          return {
            icon: <Clock className="w-5 h-5 text-yellow-400" />,
            title: `Payment Detected (${confirmations}/${paymentRequest.requiredConfirmations} confirmations)`,
            description: 'Waiting for blockchain confirmations...',
            color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-100'
          }
        }
        return {
          icon: <Clock className="w-5 h-5 text-blue-400" />,
          title: 'Waiting for Payment',
          description: 'Send Bitcoin to the address below to complete your investment.',
          color: 'bg-blue-500/10 border-blue-500/20 text-blue-100'
        }
    }
  }

  if (isLoading) {
    return (
      <AsyncWrapper
        isLoading={true}
        loadingText="Setting up Bitcoin payment..."
        error={null}
        className="min-h-[400px]"
      >
        <div />
      </AsyncWrapper>
    )
  }

  if (error && !paymentRequest) {
    return (
      <AsyncWrapper
        isLoading={false}
        error={error}
        onRetry={() => window.location.reload()}
        className="min-h-[400px]"
      >
        <div />
      </AsyncWrapper>
    )
  }

  if (!paymentRequest) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400">Failed to create payment request</p>
      </div>
    )
  }

  const status = getStatusDisplay()

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bitcoin className="w-5 h-5 text-orange-400" />
            Bitcoin Payment Gateway
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Status */}
          {status && (
            <div className={`p-4 rounded-lg border ${status.color}`}>
              <div className="flex items-center gap-3">
                {status.icon}
                <div>
                  <p className="font-semibold">{status.title}</p>
                  <p className="text-sm opacity-90">{status.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">USD Amount</label>
              <div className="flex gap-2">
                <Input
                  value={`$${amount.toFixed(2)}`}
                  readOnly
                  className="bg-background border-border font-mono"
                />
                <Button 
                  onClick={() => handleCopy('amount', amount.toString())} 
                  variant="outline" 
                  size="sm"
                >
                  {copied === 'amount' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Bitcoin Amount</label>
              <div className="flex gap-2">
                <Input
                  value={`${paymentRequest.bitcoinAmount.toFixed(8)} BTC`}
                  readOnly
                  className="bg-background border-border font-mono"
                />
                <Button 
                  onClick={() => handleCopy('amount', paymentRequest.bitcoinAmount.toFixed(8))} 
                  variant="outline" 
                  size="sm"
                >
                  {copied === 'amount' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Bitcoin Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Bitcoin Address</label>
            <div className="flex gap-2">
              <Input
                value={paymentRequest.address}
                readOnly
                className="bg-background border-border font-mono text-xs"
              />
              <Button 
                onClick={() => handleCopy('address', paymentRequest.address)} 
                variant="outline" 
                size="sm"
              >
                {copied === 'address' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
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
          {paymentRequest.status === 'pending' && timeRemaining > 0 && (
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400 mb-2">
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-muted-foreground">
                Time remaining to complete payment
              </p>
            </div>
          )}

          {/* Bitcoin Price Info */}
          <div className="bg-background p-3 rounded-lg border border-border">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Bitcoin Price:</span>
              <span className="font-mono">${bitcoinPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={handleManualCheck} 
              disabled={isChecking || paymentRequest.status === 'confirmed'}
              className="flex-1"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check Payment
                </>
              )}
            </Button>
            
            {onCancel && paymentRequest.status === 'pending' && (
              <Button 
                onClick={handleCancel}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-background p-4 rounded-lg border border-border">
            <h4 className="font-semibold text-foreground mb-2">Payment Instructions:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Copy the Bitcoin address above</li>
              <li>Open your Bitcoin wallet</li>
              <li>Send exactly <strong>{paymentRequest.bitcoinAmount.toFixed(8)} BTC</strong> to the address</li>
              <li>Wait for blockchain confirmation (usually 10-30 minutes)</li>
              <li>Payment will be automatically detected and confirmed</li>
            </ol>
          </div>

          {/* Warning */}
          <div className="bg-orange-500/10 border border-orange-500/30 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-400">Important:</p>
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