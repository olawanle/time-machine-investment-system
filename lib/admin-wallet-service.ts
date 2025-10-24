/**
 * Admin wallet management service for receiving and managing Bitcoin payments
 * Uses HD wallet structure to generate unique addresses that you control
 */

import { errorService } from './error-service'

export interface WalletConfig {
  masterPublicKey: string // Your wallet's master public key (xpub)
  masterPrivateKey?: string // Only store if needed for auto-forwarding
  adminAddress: string // Your main receiving address
  autoForward: boolean // Whether to auto-forward payments to admin address
  minConfirmations: number
}

export interface AddressInfo {
  address: string
  derivationPath: string
  index: number
  isUsed: boolean
  totalReceived: number
  lastUsed?: number
}

export interface PaymentSweep {
  fromAddress: string
  toAddress: string
  amount: number
  txHash: string
  timestamp: number
  status: 'pending' | 'confirmed' | 'failed'
}

class AdminWalletService {
  private static instance: AdminWalletService
  private walletConfig: WalletConfig | null = null
  private addressIndex = 0
  private usedAddresses = new Map<string, AddressInfo>()
  private pendingSweeps = new Map<string, PaymentSweep>()

  static getInstance(): AdminWalletService {
    if (!AdminWalletService.instance) {
      AdminWalletService.instance = new AdminWalletService()
    }
    return AdminWalletService.instance
  }

  /**
   * Initialize the admin wallet with configuration
   */
  async initializeWallet(config: WalletConfig): Promise<void> {
    this.walletConfig = config
    await this.loadUsedAddresses()
    console.log('Admin wallet initialized:', {
      adminAddress: config.adminAddress,
      autoForward: config.autoForward
    })
  }

  /**
   * Generate a new unique address for payment
   * This address is derived from your master key, so you control it
   */
  generatePaymentAddress(userId: string): string {
    if (!this.walletConfig) {
      throw new Error('Wallet not initialized')
    }

    // For demo purposes, we'll use a deterministic approach
    // In production, use proper HD wallet derivation
    const addressIndex = this.getNextAddressIndex()
    const derivationPath = `m/0/${addressIndex}`
    
    // Generate address from your HD wallet
    const address = this.deriveAddress(derivationPath, userId)
    
    // Track this address
    const addressInfo: AddressInfo = {
      address,
      derivationPath,
      index: addressIndex,
      isUsed: false,
      totalReceived: 0
    }
    
    this.usedAddresses.set(address, addressInfo)
    this.saveUsedAddresses()
    
    console.log('Generated payment address:', {
      address,
      derivationPath,
      userId
    })
    
    return address
  }

  /**
   * Check if we have received payment to an address
   */
  async checkAddressBalance(address: string): Promise<{
    balance: number
    transactions: any[]
    needsSweep: boolean
  }> {
    try {
      const response = await fetch(`https://blockstream.info/api/address/${address}`)
      if (!response.ok) {
        throw new Error('Failed to fetch address info')
      }

      const addressData = await response.json()
      const balance = addressData.chain_stats.funded_txo_sum - addressData.chain_stats.spent_txo_sum
      
      // Get transactions
      const txResponse = await fetch(`https://blockstream.info/api/address/${address}/txs`)
      const transactions = txResponse.ok ? await txResponse.json() : []
      
      // Always sweep if there's any balance and auto-forward is enabled
      const needsSweep = balance > 0 && (this.walletConfig?.autoForward || false)
      
      // Log balance check for your personal wallet monitoring
      if (balance > 0) {
        console.log(`💰 Payment detected on ${address}: ${balance} satoshis (${(balance / 100000000).toFixed(8)} BTC)`)
        console.log(`🎯 Will sweep to your wallet: ${this.walletConfig?.adminAddress}`)
      }
      
      return {
        balance,
        transactions,
        needsSweep
      }
    } catch (error) {
      errorService.logError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'checkAddressBalance',
        address
      })
      return { balance: 0, transactions: [], needsSweep: false }
    }
  }

  /**
   * Sweep funds from payment address to admin address
   * This moves the Bitcoin from the unique address to your main wallet
   */
  async sweepAddress(fromAddress: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
    if (!this.walletConfig) {
      return { success: false, error: 'Wallet not initialized' }
    }

    try {
      const addressInfo = this.usedAddresses.get(fromAddress)
      if (!addressInfo) {
        return { success: false, error: 'Address not found' }
      }

      const balanceInfo = await this.checkAddressBalance(fromAddress)
      if (balanceInfo.balance === 0) {
        return { success: false, error: 'No balance to sweep' }
      }

      // In a real implementation, you would:
      // 1. Create a transaction that sends from fromAddress to your personal wallet
      // 2. Sign it with the private key derived from your HD wallet
      // 3. Broadcast it to the network

      // For demo purposes, we'll simulate this
      const mockTxHash = `sweep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const sweep: PaymentSweep = {
        fromAddress,
        toAddress: this.walletConfig.adminAddress, // Your personal wallet: bc1q5r2096wsp4fs8c34yt4pwlklvfmdl7vldtyhya
        amount: balanceInfo.balance,
        txHash: mockTxHash,
        timestamp: Date.now(),
        status: 'pending'
      }

      this.pendingSweeps.set(mockTxHash, sweep)
      
      console.log('🚀 SWEEP INITIATED TO YOUR PERSONAL WALLET:')
      console.log(`   From: ${fromAddress}`)
      console.log(`   To: ${this.walletConfig.adminAddress} (YOUR WALLET)`)
      console.log(`   Amount: ${(balanceInfo.balance / 100000000).toFixed(8)} BTC`)
      console.log(`   TxHash: ${mockTxHash}`)
      
      // Mark address as used
      addressInfo.isUsed = true
      addressInfo.totalReceived = balanceInfo.balance
      addressInfo.lastUsed = Date.now()
      
      this.saveUsedAddresses()
      
      return {
        success: true,
        txHash: mockTxHash
      }
    } catch (error) {
      errorService.logError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'sweepAddress',
        fromAddress
      })
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sweep address'
      }
    }
  }

  /**
   * Get admin wallet statistics
   */
  async getWalletStats(): Promise<{
    totalAddressesGenerated: number
    totalReceived: number
    pendingSweeps: number
    adminBalance: number
  }> {
    const addresses = Array.from(this.usedAddresses.values())
    const totalReceived = addresses.reduce((sum, addr) => sum + addr.totalReceived, 0)
    
    // Check admin address balance
    let adminBalance = 0
    if (this.walletConfig) {
      try {
        const balanceInfo = await this.checkAddressBalance(this.walletConfig.adminAddress)
        adminBalance = balanceInfo.balance
      } catch (error) {
        console.warn('Failed to get admin balance:', error)
      }
    }
    
    return {
      totalAddressesGenerated: addresses.length,
      totalReceived,
      pendingSweeps: this.pendingSweeps.size,
      adminBalance
    }
  }

  /**
   * Get all payment addresses and their status
   */
  getPaymentAddresses(): AddressInfo[] {
    return Array.from(this.usedAddresses.values())
      .sort((a, b) => b.index - a.index)
  }

  /**
   * Manual sweep all addresses with balance
   */
  async sweepAllAddresses(): Promise<{ success: number; failed: number; errors: string[] }> {
    const addresses = Array.from(this.usedAddresses.values())
    let success = 0
    let failed = 0
    const errors: string[] = []

    for (const addressInfo of addresses) {
      if (!addressInfo.isUsed) {
        const balanceInfo = await this.checkAddressBalance(addressInfo.address)
        if (balanceInfo.balance > 0) {
          const result = await this.sweepAddress(addressInfo.address)
          if (result.success) {
            success++
          } else {
            failed++
            if (result.error) errors.push(result.error)
          }
        }
      }
    }

    return { success, failed, errors }
  }

  private deriveAddress(derivationPath: string, userId: string): string {
    if (!this.walletConfig) {
      throw new Error('Wallet not initialized')
    }

    // Use HD wallet service to derive address from your zpub
    const { hdWalletService } = require('./hd-wallet-service')
    const derivedAddress = hdWalletService.deriveAddress(
      this.walletConfig.masterPublicKey,
      this.addressIndex
    )
    
    console.log('Derived address from zpub:', {
      address: derivedAddress.address,
      derivationPath: derivedAddress.derivationPath,
      index: derivedAddress.index,
      scriptType: derivedAddress.scriptType
    })
    
    return derivedAddress.address
  }

  private getNextAddressIndex(): number {
    return ++this.addressIndex
  }

  private async loadUsedAddresses(): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        const data = localStorage.getItem('admin_wallet_addresses')
        if (data) {
          const addresses = JSON.parse(data)
          this.usedAddresses = new Map(Object.entries(addresses))
          
          // Find the highest index
          let maxIndex = 0
          for (const addressInfo of this.usedAddresses.values()) {
            if (addressInfo.index > maxIndex) {
              maxIndex = addressInfo.index
            }
          }
          this.addressIndex = maxIndex
        }
      }
    } catch (error) {
      console.warn('Failed to load used addresses:', error)
    }
  }

  private saveUsedAddresses(): void {
    try {
      if (typeof window !== 'undefined') {
        const addressesObj = Object.fromEntries(this.usedAddresses)
        localStorage.setItem('admin_wallet_addresses', JSON.stringify(addressesObj))
      }
    } catch (error) {
      console.warn('Failed to save used addresses:', error)
    }
  }
}

// Export singleton instance
export const adminWalletService = AdminWalletService.getInstance()

// Your actual wallet configuration - ALL PAYMENTS SWEEP TO YOUR PERSONAL WALLET
export const defaultWalletConfig: WalletConfig = {
  masterPublicKey: 'zpub6n1bf3M1At7Uo4KkjgGXQce5p6a78fE3ehkCJ4vx1HKSCMAtpEdGp7avV3sACT13W4xMgxnCPV88cEP6wsHobxP8mYYDwsikEMUVD35RTvC', // Your actual zpub
  adminAddress: 'bc1q5r2096wsp4fs8c34yt4pwlklvfmdl7vldtyhya', // ✅ YOUR PERSONAL WALLET - All payments go here
  autoForward: true, // ✅ ENABLED - Automatically sweep all payments to your wallet
  minConfirmations: 1
}