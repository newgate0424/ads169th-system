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
    if (!isReady) {
      onError?.('Facebook SDK ยังไม่พร้อม')
      return
    }

    setIsLoading(true)

    login((response: any) => {
      if (response.authResponse) {
        // Facebook login successful
        console.log('Facebook login successful:', response)
        
        // Here you can send the Facebook token to your backend
        // to create a session or register the user
        handleFacebookAuth(response.authResponse)
      } else {
        // User cancelled login or didn't fully authorize
        console.log('Facebook login cancelled or failed:', response)
        onError?.('การเข้าสู่ระบบด้วย Facebook ถูกยกเลิก')
        setIsLoading(false)
      }
    }, {
      scope: 'email,public_profile', // Permissions you want to request
      return_scopes: true
    })
  }

  const handleFacebookAuth = async (authResponse: any) => {
    try {
      // Get user info from Facebook
      const { api } = useFacebookSDK()
      
      // You can call Facebook API to get user information
      // and then send it to your backend for authentication
      
      // Example: Create or login user with Facebook data
      const res = await fetch('/api/auth/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: authResponse.accessToken,
          userID: authResponse.userID
        })
      })

      const data = await res.json()

      if (res.ok) {
        onSuccess?.(data)
        router.push('/dashboard')
      } else {
        onError?.(data.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
      }
    } catch (error) {
      console.error('Facebook auth error:', error)
      onError?.('เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Facebook')
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