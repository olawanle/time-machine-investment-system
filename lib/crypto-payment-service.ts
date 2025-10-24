/**
 * Comprehensive crypto payment verification service
 * Supports Bitcoin payment detection and confirmation
 */

import { errorService } from './error-service'
import type { BitcoinTransaction } from './storage'

export interface PaymentRequest {
  id: string
  userId: string
  amount: number // USD amount
  bitcoinAmount: number // BTC amount
  address: string
  createdAt: number
  expiresAt: number
  status: 'pending' | 'confirmed' | 'expired' | 'failed'
  requiredConfirmations: number
}

export interface BlockchainTransaction {
  hash: string
  amount: number // in satoshis
  confirmations: number
  timestamp: number
  fromAddress: string
  toAddress: string
  blockHeight?: number
}

export interface PaymentVerificationResult {
  success: boolean
  transaction?: BlockchainTransaction
  confirmations: number
  isComplete: boolean
  error?: string
}

class CryptoPaymentService {
  private static instance: CryptoPaymentService
  private pendingPayments = new Map<string, PaymentRequest>()
  private verificationInterval: NodeJS.Timeout | null = null
  private readonly BITCOIN_API_BASE = 'https://blockstream.info/api'
  private readonly BACKUP_API_BASE = 'https://api.blockcypher.com/v1/btc/main'
  
  // Bitcoin price cache
  private bitcoinPrice: number = 0
  private priceLastUpdated: number = 0
  private readonly PRICE_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  static getInstance(): CryptoPaymentService {
    if (!CryptoPaymentService.instance) {
      CryptoPaymentService.instance = new CryptoPaymentService()
    }
    return CryptoPaymentService.instance
  }

  private constructor() {
    this.startVerificationLoop()
    this.updateBitcoinPrice()
  }

  /**
   * Create a new payment request
   */
  async createPaymentRequest(
    userId: string, 
    usdAmount: number, 
    expirationMinutes: number = 15
  ): Promise<PaymentRequest> {
    try {
      // Get current Bitcoin price
      await this.updateBitcoinPrice()
      
      // Calculate Bitcoin amount needed
      const bitcoinAmount = usdAmount / this.bitcoinPrice
      
      // Generate unique payment address (in production, use HD wallet)
      const address = await this.generatePaymentAddress(userId)
      
      const paymentRequest: PaymentRequest = {
        id: this.generatePaymentId(),
        userId,
        amount: usdAmount,
        bitcoinAmount,
        address,
        createdAt: Date.now(),
        expiresAt: Date.now() + (expirationMinutes * 60 * 1000),
        status: 'pending',
        requiredConfirmations: 1 // Require 1 confirmation for security
      }

      this.pendingPayments.set(paymentRequest.id, paymentRequest)
      
      console.log('Payment request created:', {
        id: paymentRequest.id,
        usdAmount,
        bitcoinAmount,
        address
      })

      return paymentRequest
    } catch (error) {
      errorService.logError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'createPaymentRequest',
        userId,
        usdAmount
      })
      throw new Error('Failed to create payment request')
    }
  }

  /**
   * Verify payment for a specific request
   */
  async verifyPayment(paymentId: string): Promise<PaymentVerificationResult> {
    const paymentRequest = this.pendingPayments.get(paymentId)
    
    if (!paymentRequest) {
      return {
        success: false,
        confirmations: 0,
        isComplete: false,
        error: 'Payment request not found'
      }
    }

    if (paymentRequest.status !== 'pending') {
      return {
        success: paymentRequest.status === 'confirmed',
        confirmations: paymentRequest.status === 'confirmed' ? paymentRequest.requiredConfirmations : 0,
        isComplete: true,
        error: paymentRequest.status === 'failed' ? 'Payment failed' : undefined
      }
    }

    // Check if payment has expired
    if (Date.now() > paymentRequest.expiresAt) {
      paymentRequest.status = 'expired'
      return {
        success: false,
        confirmations: 0,
        isComplete: true,
        error: 'Payment request expired'
      }
    }

    try {
      // Check blockchain for transactions to this address
      const transactions = await this.getAddressTransactions(paymentRequest.address)
      
      // Look for transactions that match our payment criteria
      const matchingTransaction = this.findMatchingTransaction(
        transactions, 
        paymentRequest.bitcoinAmount,
        paymentRequest.createdAt
      )

      if (matchingTransaction) {
        const isComplete = matchingTransaction.confirmations >= paymentRequest.requiredConfirmations

        if (isComplete) {
          paymentRequest.status = 'confirmed'
          this.pendingPayments.delete(paymentId) // Remove from pending
        }

        return {
          success: true,
          transaction: matchingTransaction,
          confirmations: matchingTransaction.confirmations,
          isComplete,
          error: undefined
        }
      }

      return {
        success: false,
        confirmations: 0,
        isComplete: false,
        error: undefined
      }
    } catch (error) {
      errorService.logError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'verifyPayment',
        paymentId,
        address: paymentRequest.address
      })

      return {
        success: false,
        confirmations: 0,
        isComplete: false,
        error: 'Failed to verify payment'
      }
    }
  }

  /**
   * Get all pending payments for a user
   */
  getPendingPayments(userId: string): PaymentRequest[] {
    return Array.from(this.pendingPayments.values())
      .filter(payment => payment.userId === userId)
  }

  /**
   * Cancel a payment request
   */
  cancelPayment(paymentId: string): boolean {
    const payment = this.pendingPayments.get(paymentId)
    if (payment && payment.status === 'pending') {
      payment.status = 'failed'
      this.pendingPayments.delete(paymentId)
      return true
    }
    return false
  }

  /**
   * Get current Bitcoin price in USD
   */
  async getBitcoinPrice(): Promise<number> {
    if (this.bitcoinPrice > 0 && Date.now() - this.priceLastUpdated < this.PRICE_CACHE_DURATION) {
      return this.bitcoinPrice
    }
    
    await this.updateBitcoinPrice()
    return this.bitcoinPrice
  }

  private async updateBitcoinPrice(): Promise<void> {
    try {
      // Try multiple price sources for reliability
      const sources = [
        'https://api.coindesk.com/v1/bpi/currentprice/USD.json',
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
        'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'
      ]

      for (const source of sources) {
        try {
          const response = await fetch(source)
          if (!response.ok) continue

          const data = await response.json()
          let price = 0

          if (source.includes('coindesk')) {
            price = parseFloat(data.bpi.USD.rate.replace(',', ''))
          } else if (source.includes('coingecko')) {
            price = data.bitcoin.usd
          } else if (source.includes('binance')) {
            price = parseFloat(data.price)
          }

          if (price > 0) {
            this.bitcoinPrice = price
            this.priceLastUpdated = Date.now()
            console.log('Bitcoin price updated:', price)
            return
          }
        } catch (error) {
          console.warn('Failed to fetch price from', source, error)
          continue
        }
      }

      // Fallback price if all sources fail
      if (this.bitcoinPrice === 0) {
        this.bitcoinPrice = 50000 // Fallback price
        console.warn('Using fallback Bitcoin price:', this.bitcoinPrice)
      }
    } catch (error) {
      errorService.logError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'updateBitcoinPrice'
      })
    }
  }

  private async getAddressTransactions(address: string): Promise<BlockchainTransaction[]> {
    try {
      // Try primary API first
      const response = await fetch(`${this.BITCOIN_API_BASE}/address/${address}/txs`)
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const transactions = await response.json()
      
      return transactions.map((tx: any) => ({
        hash: tx.txid,
        amount: this.calculateReceivedAmount(tx, address),
        confirmations: tx.status.confirmed && tx.status.block_height ? 
          1 : 0, // Will be calculated properly in the next step
        timestamp: tx.status.block_time * 1000,
        fromAddress: tx.vin[0]?.prevout?.scriptpubkey_address || 'unknown',
        toAddress: address,
        blockHeight: tx.status.block_height
      })).filter((tx: BlockchainTransaction) => tx.amount > 0)
    } catch (error) {
      console.warn('Primary API failed, trying backup...', error)
      return this.getAddressTransactionsBackup(address)
    }
  }

  private async getAddressTransactionsBackup(address: string): Promise<BlockchainTransaction[]> {
    try {
      const response = await fetch(`${this.BACKUP_API_BASE}/addrs/${address}/full?limit=50`)
      
      if (!response.ok) {
        throw new Error(`Backup API request failed: ${response.status}`)
      }

      const data = await response.json()
      const currentHeight = await this.getCurrentBlockHeight()
      
      return data.txs.map((tx: any) => ({
        hash: tx.hash,
        amount: this.calculateReceivedAmountBackup(tx, address),
        confirmations: tx.block_height ? currentHeight - tx.block_height + 1 : 0,
        timestamp: new Date(tx.received).getTime(),
        fromAddress: tx.inputs[0]?.addresses?.[0] || 'unknown',
        toAddress: address,
        blockHeight: tx.block_height
      })).filter((tx: BlockchainTransaction) => tx.amount > 0)
    } catch (error) {
      errorService.logError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'getAddressTransactionsBackup',
        address
      })
      return []
    }
  }

  private calculateReceivedAmount(tx: any, address: string): number {
    let totalReceived = 0
    
    for (const output of tx.vout) {
      if (output.scriptpubkey_address === address) {
        totalReceived += output.value
      }
    }
    
    return totalReceived // Returns satoshis
  }

  private calculateReceivedAmountBackup(tx: any, address: string): number {
    let totalReceived = 0
    
    for (const output of tx.outputs) {
      if (output.addresses && output.addresses.includes(address)) {
        totalReceived += output.value
      }
    }
    
    return totalReceived // Returns satoshis
  }

  private async getCurrentBlockHeight(): Promise<number> {
    try {
      const response = await fetch(`${this.BITCOIN_API_BASE}/blocks/tip/height`)
      if (response.ok) {
        return parseInt(await response.text())
      }
    } catch (error) {
      console.warn('Failed to get current block height:', error)
    }
    
    // Fallback: estimate based on time (Bitcoin blocks ~10 minutes)
    const genesisTime = 1231006505000 // Bitcoin genesis block timestamp
    const avgBlockTime = 10 * 60 * 1000 // 10 minutes in milliseconds
    return Math.floor((Date.now() - genesisTime) / avgBlockTime)
  }

  private findMatchingTransaction(
    transactions: BlockchainTransaction[], 
    expectedAmount: number, 
    createdAfter: number
  ): BlockchainTransaction | null {
    const expectedSatoshis = Math.floor(expectedAmount * 100000000) // Convert BTC to satoshis
    const tolerance = Math.floor(expectedSatoshis * 0.02) // 2% tolerance for fees/price fluctuation
    
    for (const tx of transactions) {
      // Check if transaction was made after payment request creation
      if (tx.timestamp < createdAfter) continue
      
      // Check if amount is within tolerance
      const amountDiff = Math.abs(tx.amount - expectedSatoshis)
      if (amountDiff <= tolerance) {
        return tx
      }
    }
    
    return null
  }

  private async generatePaymentAddress(userId: string): Promise<string> {
    // Use admin wallet service to generate a unique address you control
    const { adminWalletService } = await import('./admin-wallet-service')
    return adminWalletService.generatePaymentAddress(userId)
  }

  private hashUserId(userId: string): number {
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  private generatePaymentId(): string {
    return `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private startVerificationLoop(): void {
    // Check pending payments every 30 seconds
    this.verificationInterval = setInterval(async () => {
      const pendingPayments = Array.from(this.pendingPayments.values())
      
      for (const payment of pendingPayments) {
        if (payment.status === 'pending') {
          try {
            await this.verifyPayment(payment.id)
          } catch (error) {
            console.error('Error in verification loop:', error)
          }
        }
      }
    }, 30000)
  }

  /**
   * Cleanup method
   */
  destroy(): void {
    if (this.verificationInterval) {
      clearInterval(this.verificationInterval)
      this.verificationInterval = null
    }
  }
}

// Export singleton instance
export const cryptoPaymentService = CryptoPaymentService.getInstance()

// Utility functions
export function satoshisToBTC(satoshis: number): number {
  return satoshis / 100000000
}

export function btcToSatoshis(btc: number): number {
  return Math.floor(btc * 100000000)
}

export function formatBitcoinAmount(satoshis: number): string {
  const btc = satoshisToBTC(satoshis)
  return btc.toFixed(8) + ' BTC'
}