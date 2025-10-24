"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AsyncWrapper } from "@/components/ui/async-wrapper"
import { useSuccessToast, useErrorToast } from "@/components/ui/toast-system"
import { 
  Bitcoin, 
  Wallet, 
  ArrowDownToLine, 
  RefreshCw, 
  ExternalLink,
  Copy,
  Settings,
  TrendingUp,
  DollarSign,
  Activity,
  AlertCircle
} from "lucide-react"
import { adminWalletService, defaultWalletConfig, type AddressInfo, type WalletConfig } from "@/lib/admin-wallet-service"
import { autoSweepMonitor } from "@/lib/auto-sweep-monitor"
import { WalletValidator } from "./wallet-validator"

interface AdminWalletPanelProps {
  onClose?: () => void
}

export function AdminWalletPanel({ onClose }: AdminWalletPanelProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [walletStats, setWalletStats] = useState<any>(null)
  const [paymentAddresses, setPaymentAddresses] = useState<AddressInfo[]>([])
  const [walletConfig, setWalletConfig] = useState<WalletConfig>(defaultWalletConfig)
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [isSweeping, setIsSweeping] = useState(false)
  const [monitorStatus, setMonitorStatus] = useState<any>(null)

  const successToast = useSuccessToast()
  const errorToast = useErrorToast()

  useEffect(() => {
    initializeWallet()
    
    // Check monitor status periodically
    const statusInterval = setInterval(() => {
      const status = autoSweepMonitor.getStatus()
      setMonitorStatus(status)
    }, 5000)

    return () => clearInterval(statusInterval)
  }, [])

  const initializeWallet = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Initialize wallet service
      await adminWalletService.initializeWallet(walletConfig)
      
      // Load wallet data
      await loadWalletData()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize wallet'
      setError(errorMessage)
      errorToast(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const loadWalletData = async () => {
    try {
      const [stats, addresses] = await Promise.all([
        adminWalletService.getWalletStats(),
        adminWalletService.getPaymentAddresses()
      ])

      setWalletStats(stats)
      setPaymentAddresses(addresses)
    } catch (err) {
      console.error('Failed to load wallet data:', err)
    }
  }

  const handleSweepAll = async () => {
    try {
      setIsSweeping(true)
      const result = await autoSweepMonitor.forceSweepAll()
      
      if (result.success > 0) {
        successToast(`Successfully swept ${result.success} addresses to your personal wallet`)
        await loadWalletData()
      }
      
      if (result.failed > 0) {
        errorToast(`Failed to sweep ${result.failed} addresses`)
      }
      
      if (result.success === 0 && result.failed === 0) {
        successToast('No addresses with balance found to sweep')
      }
    } catch (err) {
      errorToast('Failed to sweep addresses')
    } finally {
      setIsSweeping(false)
    }
  }

  const handleSweepAddress = async (address: string) => {
    try {
      const result = await adminWalletService.sweepAddress(address)
      
      if (result.success) {
        successToast(`Swept address successfully`)
        await loadWalletData()
      } else {
        errorToast(result.error || 'Failed to sweep address')
      }
    } catch (err) {
      errorToast('Failed to sweep address')
    }
  }

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    successToast('Address copied to clipboard')
  }

  const handleUpdateConfig = async () => {
    try {
      setIsConfiguring(true)
      await adminWalletService.initializeWallet(walletConfig)
      successToast('Wallet configuration updated')
      await loadWalletData()
    } catch (err) {
      errorToast('Failed to update wallet configuration')
    } finally {
      setIsConfiguring(false)
    }
  }

  const formatBTC = (satoshis: number) => {
    return (satoshis / 100000000).toFixed(8) + ' BTC'
  }

  const getStatusColor = (isUsed: boolean, totalReceived: number) => {
    if (totalReceived > 0) return 'bg-green-500/20 text-green-400'
    if (isUsed) return 'bg-yellow-500/20 text-yellow-400'
    return 'bg-gray-500/20 text-gray-400'
  }

  const getStatusText = (isUsed: boolean, totalReceived: number) => {
    if (totalReceived > 0) return 'Received'
    if (isUsed) return 'Used'
    return 'Generated'
  }

  if (isLoading) {
    return (
      <AsyncWrapper
        isLoading={true}
        loadingText="Loading admin wallet..."
        error={null}
        className="min-h-[600px]"
      >
        <div />
      </AsyncWrapper>
    )
  }

  if (error) {
    return (
      <AsyncWrapper
        isLoading={false}
        error={error}
        onRetry={initializeWallet}
        className="min-h-[600px]"
      >
        <div />
      </AsyncWrapper>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Wallet Management</h1>
          <p className="text-muted-foreground">Manage Bitcoin payments and wallet addresses</p>
        </div>
        {onClose && (
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        )}
      </div>

      {/* Wallet Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Admin Balance</p>
                <p className="text-lg font-bold text-foreground">
                  {formatBTC(walletStats?.adminBalance || 0)}
                </p>
              </div>
              <Wallet className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Received</p>
                <p className="text-lg font-bold text-foreground">
                  {formatBTC(walletStats?.totalReceived || 0)}
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Addresses Generated</p>
                <p className="text-lg font-bold text-foreground">
                  {walletStats?.totalAddressesGenerated || 0}
                </p>
              </div>
              <Activity className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Auto-Sweep Status</p>
                <p className="text-lg font-bold text-foreground">
                  {monitorStatus?.isMonitoring ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className={`w-6 h-6 rounded-full ${monitorStatus?.isMonitoring ? 'bg-green-500' : 'bg-gray-500'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Validator */}
      <WalletValidator initialZpub={walletConfig.masterPublicKey} />

      {/* Auto-Sweep Monitor */}
      <Card className="bg-green-500/10 border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownToLine className="w-5 h-5 text-green-400" />
            Auto-Sweep Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
            <div>
              <h4 className="font-semibold text-foreground">Your Personal Wallet</h4>
              <p className="text-sm text-muted-foreground font-mono">
                bc1q5r2096wsp4fs8c34yt4pwlklvfmdl7vldtyhya
              </p>
              <p className="text-xs text-green-400 mt-1">
                ✅ All payments automatically sweep to this address
              </p>
            </div>
            <div className="text-right">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                monitorStatus?.isMonitoring 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {monitorStatus?.isMonitoring ? '🟢 Monitoring Active' : '🔴 Monitoring Inactive'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Checks every 30 seconds
              </p>
            </div>
          </div>

          <div className="bg-background p-3 rounded-lg border border-border">
            <h4 className="font-semibold text-foreground mb-2">How Auto-Sweep Works:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>System monitors all payment addresses every 30 seconds</li>
              <li>When Bitcoin is detected, it's automatically swept to your wallet</li>
              <li>No manual intervention required - completely automated</li>
              <li>All funds end up in your personal wallet: bc1q5r2096wsp4fs8c34yt4pwlklvfmdl7vldtyhya</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Configuration */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Wallet Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Admin Bitcoin Address</label>
              <div className="flex gap-2">
                <Input
                  value={walletConfig.adminAddress}
                  onChange={(e) => setWalletConfig(prev => ({ ...prev, adminAddress: e.target.value }))}
                  className="font-mono text-xs"
                  placeholder="bc1q..."
                />
                <Button 
                  onClick={() => handleCopyAddress(walletConfig.adminAddress)}
                  variant="outline" 
                  size="sm"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Auto-Forward Payments</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={walletConfig.autoForward}
                  onChange={(e) => setWalletConfig(prev => ({ ...prev, autoForward: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-muted-foreground">
                  Automatically sweep payments to admin address
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleUpdateConfig}
              disabled={isConfiguring}
              className="btn-primary"
            >
              {isConfiguring ? 'Updating...' : 'Update Configuration'}
            </Button>
            
            <Button 
              onClick={handleSweepAll}
              disabled={isSweeping}
              variant="outline"
            >
              {isSweeping ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sweeping...
                </>
              ) : (
                <>
                  <ArrowDownToLine className="w-4 h-4 mr-2" />
                  Sweep All Addresses
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Addresses */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bitcoin className="w-5 h-5 text-orange-400" />
            Payment Addresses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentAddresses.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No payment addresses generated yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentAddresses.map((addressInfo) => (
                <div 
                  key={addressInfo.address}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-foreground">
                        {addressInfo.address}
                      </span>
                      <Badge className={getStatusColor(addressInfo.isUsed, addressInfo.totalReceived)}>
                        {getStatusText(addressInfo.isUsed, addressInfo.totalReceived)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Index: {addressInfo.index}</span>
                      <span>Path: {addressInfo.derivationPath}</span>
                      {addressInfo.totalReceived > 0 && (
                        <span className="text-green-400">
                          Received: {formatBTC(addressInfo.totalReceived)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleCopyAddress(addressInfo.address)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      onClick={() => window.open(`https://blockstream.info/address/${addressInfo.address}`, '_blank')}
                      variant="outline"
                      size="sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    
                    {addressInfo.totalReceived > 0 && !addressInfo.isUsed && (
                      <Button
                        onClick={() => handleSweepAddress(addressInfo.address)}
                        variant="outline"
                        size="sm"
                        className="text-orange-400 border-orange-400/20 hover:bg-orange-400/10"
                      >
                        <ArrowDownToLine className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Card className="bg-orange-500/10 border-orange-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-orange-400 mb-2">Important Setup Instructions</h4>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>1. Update Admin Address:</strong> Replace the admin address above with your actual Bitcoin wallet address where you want to receive payments.
                </p>
                <p>
                  <strong>2. HD Wallet Setup:</strong> For production use, implement proper HD wallet derivation using your master public key (xpub) to generate unique addresses you control.
                </p>
                <p>
                  <strong>3. Auto-Sweep:</strong> Enable auto-forwarding to automatically move payments from unique addresses to your main wallet.
                </p>
                <p>
                  <strong>4. Security:</strong> Never store private keys in the frontend. Use a secure backend service for transaction signing.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}