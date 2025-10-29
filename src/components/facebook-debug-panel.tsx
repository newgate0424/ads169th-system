'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function FacebookDebugPanel() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const checkFacebookSDK = () => {
      const info = {
        sdkLoaded: typeof window !== 'undefined' && !!window.FB,
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
        apiVersion: process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION,
        scriptExists: !!document.getElementById('facebook-jssdk'),
        fbAsyncInit: typeof window !== 'undefined' && typeof window.fbAsyncInit === 'function',
        timestamp: new Date().toLocaleTimeString()
      }
      setDebugInfo(info)
    }

    if (isVisible) {
      checkFacebookSDK()
      const interval = setInterval(checkFacebookSDK, 2000)
      return () => clearInterval(interval)
    }
  }, [isVisible])

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isVisible ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200"
        >
          FB Debug
        </Button>
      ) : (
        <Card className="w-80 max-h-96 overflow-auto">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Facebook SDK Debug</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>SDK Loaded:</div>
              <div className={debugInfo.sdkLoaded ? 'text-green-600' : 'text-red-600'}>
                {debugInfo.sdkLoaded ? '✓' : '✗'}
              </div>
              
              <div>App ID:</div>
              <div className={debugInfo.appId !== 'your-facebook-app-id' ? 'text-green-600' : 'text-red-600'}>
                {debugInfo.appId?.slice(0, 8)}...
              </div>
              
              <div>Script:</div>
              <div className={debugInfo.scriptExists ? 'text-green-600' : 'text-red-600'}>
                {debugInfo.scriptExists ? '✓' : '✗'}
              </div>
              
              <div>fbAsyncInit:</div>
              <div className={debugInfo.fbAsyncInit ? 'text-green-600' : 'text-red-600'}>
                {debugInfo.fbAsyncInit ? '✓' : '✗'}
              </div>
            </div>
            
            <div className="pt-2 border-t text-gray-500">
              Last check: {debugInfo.timestamp}
            </div>
            
            {debugInfo.sdkLoaded && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => {
                  if (window.FB) {
                    window.FB.login((response: any) => {
                      console.log('Test FB Login:', response)
                    }, { scope: 'email' })
                  }
                }}
              >
                Test FB Login
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}