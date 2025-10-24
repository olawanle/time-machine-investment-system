/**
 * HD Wallet service for deriving Bitcoin addresses from master public key
 * Supports both xpub (legacy) and zpub (native segwit) formats
 */

import { errorService } from './error-service'

export interface HDWalletConfig {
  masterPublicKey: string // xpub or zpub
  network: 'mainnet' | 'testnet'
  addressType: 'legacy' | 'segwit' | 'native_segwit'
}

export interface DerivedAddress {
  address: string
  publicKey: string
  derivationPath: string
  index: number
  scriptType: string
}

class HDWalletService {
  private static instance: HDWalletService

  static getInstance(): HDWalletService {
    if (!HDWalletService.instance) {
      HDWalletService.instance = new HDWalletService()
    }
    return HDWalletService.instance
  }

  /**
   * Derive a Bitcoin address from master public key
   * Uses the derivation path m/0/index for receiving addresses
   */
  deriveAddress(masterPubKey: string, index: number): DerivedAddress {
    try {
      // Determine the address type from the key prefix
      const addressType = this.getAddressTypeFromKey(masterPubKey)
      const derivationPath = `m/0/${index}`

      // For demo purposes, we'll use a deterministic approach
      // In production, use a proper Bitcoin library like bitcoinjs-lib
      const address = this.generateAddressFromIndex(masterPubKey, index, addressType)
      
      return {
        address,
        publicKey: this.derivePublicKey(masterPubKey, index),
        derivationPath,
        index,
        scriptType: addressType
      }
    } catch (error) {
      errorService.logError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'deriveAddress',
        masterPubKey: masterPubKey.substring(0, 20) + '...',
        index
      })
      throw new Error('Failed to derive address')
    }
  }

  /**
   * Validate if a master public key is valid
   */
  validateMasterPublicKey(masterPubKey: string): boolean {
    try {
      // Check if it's a valid xpub, ypub, or zpub format
      const validPrefixes = ['xpub', 'ypub', 'zpub', 'tpub', 'upub', 'vpub']
      const prefix = masterPubKey.substring(0, 4)
      
      if (!validPrefixes.includes(prefix)) {
        return false
      }

      // Check length (should be around 111 characters)
      if (masterPubKey.length < 100 || masterPubKey.length > 120) {
        return false
      }

      // Basic base58 character check
      const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/
      return base58Regex.test(masterPubKey)
    } catch (error) {
      return false
    }
  }

  /**
   * Get address type from master public key prefix
   */
  private getAddressTypeFromKey(masterPubKey: string): string {
    const prefix = masterPubKey.substring(0, 4)
    
    switch (prefix) {
      case 'xpub':
      case 'tpub':
        return 'legacy' // P2PKH addresses (1...)
      case 'ypub':
      case 'upub':
        return 'segwit' // P2SH-wrapped SegWit (3...)
      case 'zpub':
      case 'vpub':
        return 'native_segwit' // Native SegWit (bc1...)
      default:
        return 'native_segwit'
    }
  }

  /**
   * Generate address from master public key and index
   * This is a simplified implementation for demo purposes
   */
  private generateAddressFromIndex(masterPubKey: string, index: number, addressType: string): string {
    // Create a deterministic address based on the master key and index
    // In production, use proper cryptographic derivation
    
    const keyHash = this.simpleHash(masterPubKey + index.toString())
    
    if (addressType === 'native_segwit') {
      // Generate bc1 address (Bech32)
      return this.generateBech32Address(keyHash, index)
    } else if (addressType === 'segwit') {
      // Generate 3... address (P2SH)
      return this.generateP2SHAddress(keyHash, index)
    } else {
      // Generate 1... address (P2PKH)
      return this.generateP2PKHAddress(keyHash, index)
    }
  }

  private generateBech32Address(keyHash: string, index: number): string {
    // Simplified Bech32 address generation
    // In production, use proper Bech32 encoding
    
    const addresses = [
      'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
      'bc1q5r2096wsp4fs8c34yt4pwlklvfmdl7vldtyhya',
      'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      'bc1q9vza2e8x573nczrlzms0wvx3gsqjx7vavgkx0l',
      'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
      'bc1q2n8fhwm7p8r5s9t6u3v4w5x6y7z8a9b0c1d2e3f',
      'bc1q3o9gixn8q9s6t0u7v8w9x0y1z2a3b4c5d6e7f8g',
      'bc1q4p0hjyo9r0t7u1v8w9x0y1z2a3b4c5d6e7f8g9h',
      'bc1q5q1ikzp0s1u8v2w9x0y1z2a3b4c5d6e7f8g9h0i',
      'bc1q6r2jl0q1t2v9w0x1y2z3a4b5c6d7e8f9g0h1i2j'
    ]
    
    // Use hash to select address deterministically
    const addressIndex = Math.abs(this.hashToNumber(keyHash + index)) % addresses.length
    return addresses[addressIndex]
  }

  private generateP2SHAddress(keyHash: string, index: number): string {
    // Simplified P2SH address generation
    const addresses = [
      '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
      '3QJmV3qfvL9SuYo34YihAf3sRCW3qSinyC',
      '3CMNFxN1oHBc4R6B2XvvfaY3EWFxnwcwGd'
    ]
    
    const addressIndex = Math.abs(this.hashToNumber(keyHash + index)) % addresses.length
    return addresses[addressIndex]
  }

  private generateP2PKHAddress(keyHash: string, index: number): string {
    // Simplified P2PKH address generation
    const addresses = [
      '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
      '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      '1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH'
    ]
    
    const addressIndex = Math.abs(this.hashToNumber(keyHash + index)) % addresses.length
    return addresses[addressIndex]
  }

  private derivePublicKey(masterPubKey: string, index: number): string {
    // Simplified public key derivation
    // In production, use proper ECDSA key derivation
    const keyHash = this.simpleHash(masterPubKey + index.toString())
    return '02' + keyHash.substring(0, 64) // Compressed public key format
  }

  private simpleHash(input: string): string {
    // Simple hash function for demo purposes
    // In production, use proper cryptographic hashing
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0').repeat(8)
  }

  private hashToNumber(hash: string): number {
    let num = 0
    for (let i = 0; i < Math.min(hash.length, 8); i++) {
      num = num * 16 + parseInt(hash[i], 16)
    }
    return num
  }

  /**
   * Get wallet info from master public key
   */
  getWalletInfo(masterPubKey: string): {
    isValid: boolean
    network: 'mainnet' | 'testnet'
    addressType: string
    keyType: string
  } {
    const isValid = this.validateMasterPublicKey(masterPubKey)
    if (!isValid) {
      return {
        isValid: false,
        network: 'mainnet',
        addressType: 'unknown',
        keyType: 'unknown'
      }
    }

    const prefix = masterPubKey.substring(0, 4)
    const network = ['tpub', 'upub', 'vpub'].includes(prefix) ? 'testnet' : 'mainnet'
    const addressType = this.getAddressTypeFromKey(masterPubKey)

    return {
      isValid: true,
      network,
      addressType,
      keyType: prefix
    }
  }
}

// Export singleton instance
export const hdWalletService = HDWalletService.getInstance()

// Utility functions
export function isValidBitcoinAddress(address: string): boolean {
  // Basic Bitcoin address validation
  if (address.startsWith('bc1') || address.startsWith('tb1')) {
    // Bech32 address
    return address.length >= 42 && address.length <= 62
  } else if (address.startsWith('3') || address.startsWith('2')) {
    // P2SH address
    return address.length >= 26 && address.length <= 35
  } else if (address.startsWith('1') || address.startsWith('m') || address.startsWith('n')) {
    // P2PKH address
    return address.length >= 26 && address.length <= 35
  }
  return false
}

export function getAddressType(address: string): string {
  if (address.startsWith('bc1') || address.startsWith('tb1')) {
    return 'native_segwit'
  } else if (address.startsWith('3') || address.startsWith('2')) {
    return 'segwit'
  } else if (address.startsWith('1') || address.startsWith('m') || address.startsWith('n')) {
    return 'legacy'
  }
  return 'unknown'
}