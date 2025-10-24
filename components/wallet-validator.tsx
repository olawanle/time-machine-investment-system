"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useSuccessToast, useErrorToast } from "@/components/ui/toast-system"
import { 
  CheckCircle, 
  XCircle, 
  Info, 
  Key, 
  Wallet,
  Copy,
  ExternalLink
} from "lucide-react"
import { hdWalletService, isValidBitcoinAddress, getAddressType } from "@/lib/hd-wallet-service"

interface WalletValidatorProps {
  initialZpub?: string
}

export function WalletValidator({ initialZpub = '' }: WalletValidatorProps) {
  const [zpub, setZpub] = useState(initialZpub)
  const [validationResult, setValidationResult] = useState<any>(null)
  const [derivedAddresses, setDerivedAddresses] = useState<any[]>([])
  const [isValidating, setIsValidating] = useState(false)

  const successToast = useSuccessToast()
  const errorToast = useErrorToast()

  const handleValidate = async () => {
    if (!zpub.trim()) {
      errorToast('Please enter a zpub key')
      return
    }

    setIsValidating(true)
    
    try {
      // Validate the zpub
      const walletInfo = hdWalletService.getWalletInfo(zpub)
      setValidationResult(walletInfo)

      if (walletInfo.isValid) {
        // Generate first 5 addresses for testing
        const addresses = []
        for (let i = 0; i < 5; i++) {
          try {
            const derived = hdWalletService.deriveAddress(zpub, i)
            addresses.push(derived)
          } catch (error) {
            console.error(`Failed to derive address ${i}:`, error)
          }
        }
        setDerivedAddresses(addresses)
        successToast('Zpub validated successfully!')
      } else {
        errorToast('Invalid zpub format')
        setDerivedAddresses([])
      }
    } catch (error) {
      errorToast('Failed to validate zpub')
      setValidationResult(null)
      setDerivedAddresses([])
    } finally {
      setIsValidating(false)
    }
  }

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    successToast('Address copied to clipboard')
  }

  const getStatusColor = (isValid: boolean) => {
    return isValid ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
  }

  const getNetworkColor = (network: string) => {
    return network === 'mainnet' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
  }

  return (
    <div className="space-y-6">
      {/* Validation Input */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            Wallet Validation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Master Public Key (zpub/xpub)</label>
            <div className="flex gap-2">
              <Input
                value={zpub}
                onChange={(e) => setZpub(e.target.value)}
                placeholder="zpub6n1bf3M1At7Uo4KkjgGXQce5p6a78fE3ehkCJ4vx1HKSCMAtpEdGp7avV3sACT13W4xMgxnCPV88cEP6wsHobxP8mYYDwsikEMUVD35RTvC"
                className="font-mono text-xs"
              />
              <Button 
                onClick={handleValidate}
                disabled={isValidating}
                className="btn-primary"
              >
                {isValidating ? 'Validating...' : 'Validate'}
              </Button>
            </div>
          </div>

          {/* Validation Results */}
          {validationResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge className={getStatusColor(validationResult.isValid)}>
                  {validationResult.isValid ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Valid
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 mr-1" />
                      Invalid
                    </>
                  )}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Network:</span>
                <Badge className={getNetworkColor(validationResult.network)}>
                  {validationResult.network}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Type:</span>
                <Badge variant="secondary">
                  {validationResult.keyType}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Addresses:</span>
                <Badge variant="secondary">
                  {validationResult.addressType}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Derived Addresses */}
      {derivedAddresses.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Derived Addresses (First 5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {derivedAddresses.map((addressInfo, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-foreground">
                        {addressInfo.address}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {addressInfo.scriptType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Index: {addressInfo.index}</span>
                      <span>Path: {addressInfo.derivationPath}</span>
                      <span className={isValidBitcoinAddress(addressInfo.address) ? 'text-green-400' : 'text-red-400'}>
                        {isValidBitcoinAddress(addressInfo.address) ? 'Valid Format' : 'Invalid Format'}
                      </span>
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
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-400 mb-2">How This Works</h4>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>1. Your zpub:</strong> This is your wallet's master public key. It allows generating unlimited receiving addresses without exposing private keys.
                </p>
                <p>
                  <strong>2. Address Derivation:</strong> Each payment gets a unique address derived from your zpub using the path m/0/index.
                </p>
                <p>
                  <strong>3. You Control All Addresses:</strong> Since they're derived from your wallet, you can access funds sent to any of these addresses.
                </p>
                <p>
                  <strong>4. Privacy & Security:</strong> Users get unique addresses while you maintain full control of all funds.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}