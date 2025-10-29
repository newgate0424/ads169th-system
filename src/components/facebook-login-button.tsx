'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useFacebookSDK } from '@/components/facebook-sdk'
import { useRouter } from 'next/navigation'

interface FacebookLoginButtonProps {
  onSuccess?: (response: any) => void
  onError?: (error: any) => void
  disabled?: boolean
}

export function FacebookLoginButton({ 
  onSuccess, 
  onError, 
  disabled = false 
}: FacebookLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { login, isReady } = useFacebookSDK()
  const router = useRouter()

  const handleFacebookLogin = async () => {
    // Check if Facebook SDK is ready
    if (!isReady) {
      onError?.('Facebook SDK ยังไม่พร้อม กรุณาลองใหม่อีกครั้ง')
      return
    }

    // Check if App ID is valid
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
    if (!appId || appId === 'your-facebook-app-id') {
      onError?.('Facebook App ID ไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ')
      return
    }

    setIsLoading(true)

    // Set timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setIsLoading(false)
      onError?.('หมดเวลาการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง')
    }, 30000) // 30 seconds timeout

    try {
      login((response: any) => {
        clearTimeout(timeout) // Clear timeout when response received
        
        if (response.authResponse) {
          // Facebook login successful
          console.log('Facebook login successful:', response)
          handleFacebookAuth(response.authResponse)
        } else {
          // User cancelled login or didn't fully authorize
          console.log('Facebook login cancelled or failed:', response)
          onError?.('การเข้าสู่ระบบด้วย Facebook ถูกยกเลิก')
          setIsLoading(false)
        }
      }, {
        scope: 'email,public_profile',
        return_scopes: true
      })
    } catch (error) {
      clearTimeout(timeout)
      console.error('Facebook login error:', error)
      onError?.('เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Facebook')
      setIsLoading(false)
    }
  }

  const handleFacebookAuth = async (authResponse: any) => {
    try {
      // Set timeout for API call
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 seconds

      const res = await fetch('/api/auth/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: authResponse.accessToken,
          userID: authResponse.userID
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const data = await res.json()

      if (res.ok) {
        onSuccess?.(data)
        router.push('/dashboard')
        router.refresh()
      } else {
        onError?.(data.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
      }
    } catch (error: any) {
      console.error('Facebook auth error:', error)
      
      if (error.name === 'AbortError') {
        onError?.('หมดเวลาการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง')
      } else {
        onError?.('เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Facebook')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white border-[#1877F2] hover:border-[#166FE5]"
      onClick={handleFacebookLogin}
      disabled={disabled || isLoading || !isReady}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>กำลังเข้าสู่ระบบ...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>เข้าสู่ระบบด้วย Facebook</span>
        </div>
      )}
    </Button>
  )
}