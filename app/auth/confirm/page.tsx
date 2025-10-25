'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ConfirmEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type') as 'signup' | 'email' | 'magiclink' | 'recovery' | null

        if (!token_hash || !type) {
          setStatus('error')
          setMessage('Invalid confirmation link')
          return
        }

        const validTypes = ['signup', 'email', 'magiclink', 'recovery']
        if (!validTypes.includes(type)) {
          setStatus('error')
          setMessage(`Invalid confirmation type: ${type}`)
          return
        }

        const supabase = createClient()
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type,
        })

        if (error) {
          setStatus('error')
          setMessage(error.message || 'Failed to confirm email')
          return
        }

        setStatus('success')
        setMessage('Email confirmed successfully! Redirecting to dashboard...')
        
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } catch (error) {
        console.error('Confirmation error:', error)
        setStatus('error')
        setMessage('An unexpected error occurred')
      }
    }

    confirmEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020817] via-[#0b1220] to-[#020817] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Email Confirmation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-[#3CE7FF] animate-spin" />
              <p className="text-center text-white/70">Confirming your email...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-[#22c55e]" />
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-white">{message}</p>
                <p className="text-sm text-white/60">You'll be redirected shortly</p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-500" />
              <div className="text-center space-y-4">
                <p className="text-lg font-semibold text-white">{message}</p>
                <Button
                  onClick={() => router.push('/')}
                  className="btn-primary"
                >
                  Return to Home
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
