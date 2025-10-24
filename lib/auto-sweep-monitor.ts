/**
 * Automatic sweep monitor - continuously monitors payment addresses 
 * and automatically sweeps funds to your personal wallet
 */

import { adminWalletService } from './admin-wallet-service'
import { errorService } from './error-service'

class AutoSweepMonitor {
  private static instance: AutoSweepMonitor
  private monitorInterval: NodeJS.Timeout | null = null
  private isMonitoring = false
  private sweepQueue = new Set<string>()

  static getInstance(): AutoSweepMonitor {
    if (!AutoSweepMonitor.instance) {
      AutoSweepMonitor.instance = new AutoSweepMonitor()
    }
    return AutoSweepMonitor.instance
  }

  /**
   * Start monitoring all payment addresses for incoming funds
   */
  startMonitoring(intervalSeconds: number = 30): void {
    if (this.isMonitoring) {
      console.log('Auto-sweep monitor already running')
      return
    }

    this.isMonitoring = true
    console.log('🔄 Starting auto-sweep monitor - checking every', intervalSeconds, 'seconds')
    console.log('💰 All payments will be automatically swept to: bc1q5r2096wsp4fs8c34yt4pwlklvfmdl7vldtyhya')

    this.monitorInterval = setInterval(async () => {
      await this.checkAndSweepAll()
    }, intervalSeconds * 1000)

    // Also run an initial check
    setTimeout(() => this.checkAndSweepAll(), 1000)
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval)
      this.monitorInterval = null
    }
    this.isMonitoring = false
    console.log('⏹️ Auto-sweep monitor stopped')
  }

  /**
   * Check all payment addresses and sweep any with balance
   */
  private async checkAndSweepAll(): Promise<void> {
    try {
      const paymentAddresses = adminWalletService.getPaymentAddresses()
      
      if (paymentAddresses.length === 0) {
        return // No addresses to check yet
      }

      console.log(`🔍 Checking ${paymentAddresses.length} payment addresses for funds...`)

      let totalSwept = 0
      let addressesSwept = 0

      for (const addressInfo of paymentAddresses) {
        // Skip if already in sweep queue
        if (this.sweepQueue.has(addressInfo.address)) {
          continue
        }

        try {
          const balanceInfo = await adminWalletService.checkAddressBalance(addressInfo.address)
          
          if (balanceInfo.needsSweep && balanceInfo.balance > 0) {
            console.log(`💰 Found ${(balanceInfo.balance / 100000000).toFixed(8)} BTC on ${addressInfo.address}`)
            
            // Add to sweep queue to prevent duplicate sweeps
            this.sweepQueue.add(addressInfo.address)
            
            // Initiate sweep
            const sweepResult = await adminWalletService.sweepAddress(addressInfo.address)
            
            if (sweepResult.success) {
              totalSwept += balanceInfo.balance
              addressesSwept++
              console.log(`✅ Swept ${addressInfo.address} → YOUR WALLET`)
            } else {
              console.error(`❌ Failed to sweep ${addressInfo.address}:`, sweepResult.error)
            }
            
            // Remove from queue after processing
            this.sweepQueue.delete(addressInfo.address)
            
            // Small delay between sweeps to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        } catch (error) {
          console.error(`Error checking address ${addressInfo.address}:`, error)
          this.sweepQueue.delete(addressInfo.address)
        }
      }

      if (addressesSwept > 0) {
        console.log(`🎉 AUTO-SWEEP COMPLETE:`)
        console.log(`   Addresses swept: ${addressesSwept}`)
        console.log(`   Total amount: ${(totalSwept / 100000000).toFixed(8)} BTC`)
        console.log(`   Destination: bc1q5r2096wsp4fs8c34yt4pwlklvfmdl7vldtyhya (YOUR WALLET)`)
      }
    } catch (error) {
      errorService.logError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'checkAndSweepAll'
      })
    }
  }

  /**
   * Force check and sweep all addresses immediately
   */
  async forceSweepAll(): Promise<{ success: number; failed: number; totalAmount: number }> {
    console.log('🚀 FORCE SWEEP INITIATED - Checking all addresses immediately...')
    
    const paymentAddresses = adminWalletService.getPaymentAddresses()
    let success = 0
    let failed = 0
    let totalAmount = 0

    for (const addressInfo of paymentAddresses) {
      try {
        const balanceInfo = await adminWalletService.checkAddressBalance(addressInfo.address)
        
        if (balanceInfo.balance > 0) {
          const sweepResult = await adminWalletService.sweepAddress(addressInfo.address)
          
          if (sweepResult.success) {
            success++
            totalAmount += balanceInfo.balance
            console.log(`✅ Force swept ${addressInfo.address}: ${(balanceInfo.balance / 100000000).toFixed(8)} BTC`)
          } else {
            failed++
            console.error(`❌ Failed to force sweep ${addressInfo.address}:`, sweepResult.error)
          }
        }
      } catch (error) {
        failed++
        console.error(`Error force sweeping ${addressInfo.address}:`, error)
      }
    }

    console.log(`🎯 FORCE SWEEP COMPLETE:`)
    console.log(`   Successful: ${success}`)
    console.log(`   Failed: ${failed}`)
    console.log(`   Total swept: ${(totalAmount / 100000000).toFixed(8)} BTC`)
    console.log(`   All funds sent to: bc1q5r2096wsp4fs8c34yt4pwlklvfmdl7vldtyhya`)

    return { success, failed, totalAmount }
  }

  /**
   * Get monitoring status
   */
  getStatus(): {
    isMonitoring: boolean
    queueSize: number
    personalWallet: string
  } {
    return {
      isMonitoring: this.isMonitoring,
      queueSize: this.sweepQueue.size,
      personalWallet: 'bc1q5r2096wsp4fs8c34yt4pwlklvfmdl7vldtyhya'
    }
  }
}

// Export singleton instance
export const autoSweepMonitor = AutoSweepMonitor.getInstance()

// Auto-start monitoring when module loads (for production)
if (typeof window !== 'undefined') {
  // Start monitoring after a short delay to allow initialization
  setTimeout(() => {
    autoSweepMonitor.startMonitoring(30) // Check every 30 seconds
  }, 5000)
}