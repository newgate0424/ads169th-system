'use client'

import { useState } from 'react'
import { FacebookLoginButton } from './facebook-login-button'
import { Button } from './ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface OptionalFacebookLoginProps {
  onSuccess?: (response: any) => void
  onError?: (error: any) => void
  disabled?: boolean
}

export function OptionalFacebookLogin({
  onSuccess,
  onError,
  disabled = false
}: OptionalFacebookLoginProps) {
  const [showFacebookLogin, setShowFacebookLogin] = useState(false)

  // Check if Facebook is configured
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
  const isFacebookConfigured = appId && appId !== 'your-facebook-app-id'

  // Don't show if not configured
  if (!isFacebookConfigured) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="my-4 flex items-center">
        <div className="flex-1 border-t border-muted-foreground/20"></div>
        <span className="px-3 text-sm text-muted-foreground">หรือ</span>
        <div className="flex-1 border-t border-muted-foreground/20"></div>
      </div>

      {!showFacebookLogin ? (
        <Button
          type="button"
          variant="ghost"
          className="w-full text-muted-foreground hover:text-foreground"
          onClick={() => setShowFacebookLogin(true)}
          disabled={disabled}
        >
          <div className="flex items-center space-x-2">
            <span>เข้าสู่ระบบด้วย Facebook</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </Button>
      ) : (
        <div className="space-y-2">
          <FacebookLoginButton
            onSuccess={onSuccess}
            onError={onError}
            disabled={disabled}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setShowFacebookLogin(false)}
            disabled={disabled}
          >
            <div className="flex items-center space-x-1">
              <span>ซ่อน</span>
              <ChevronUp className="w-3 h-3" />
            </div>
          </Button>
        </div>
      )}
    </div>
  )
}