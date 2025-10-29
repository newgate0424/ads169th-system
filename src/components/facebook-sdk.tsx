'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    fbAsyncInit: () => void
    FB: any
  }
}

interface FacebookSDKProps {
  appId: string
  version?: string
  language?: string
}

export function FacebookSDK({ 
  appId, 
  version = 'v18.0',
  language = 'th_TH' 
}: FacebookSDKProps) {
  useEffect(() => {
    // Skip if no valid App ID
    if (!appId || appId === 'your-facebook-app-id') {
      console.warn('Facebook SDK: Invalid App ID provided')
      return
    }

    // Initialize Facebook SDK
    window.fbAsyncInit = function() {
      if (window.FB) {
        window.FB.init({
          appId: appId,
          cookie: true,
          xfbml: true,
          version: version
        })
        
        // Log page view
        window.FB.AppEvents.logPageView()
        
        console.log('Facebook SDK initialized successfully')
      }
    }

    // Load Facebook SDK script
    const loadFacebookSDK = () => {
      if (document.getElementById('facebook-jssdk')) {
        return // Already loaded
      }

      const script = document.createElement('script')
      script.id = 'facebook-jssdk'
      script.src = `https://connect.facebook.net/${language}/sdk.js`
      script.async = true
      script.defer = true
      
      // Add load and error handlers
      script.onload = () => {
        console.log('Facebook SDK script loaded')
      }
      
      script.onerror = () => {
        console.error('Failed to load Facebook SDK')
      }

      const firstScript = document.getElementsByTagName('script')[0]
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript)
      }
    }

    loadFacebookSDK()

    // Cleanup function
    return () => {
      // Remove the script when component unmounts
      const script = document.getElementById('facebook-jssdk')
      if (script) {
        script.remove()
      }
    }
  }, [appId, version, language])

  return null // This component doesn't render anything visible
}

// Hook for using Facebook SDK
export function useFacebookSDK() {
  const login = (callback?: (response: any) => void, options?: any) => {
    if (window.FB) {
      window.FB.login(callback, options)
    }
  }

  const logout = (callback?: (response: any) => void) => {
    if (window.FB) {
      window.FB.logout(callback)
    }
  }

  const getLoginStatus = (callback: (response: any) => void) => {
    if (window.FB) {
      window.FB.getLoginStatus(callback)
    }
  }

  const share = (options: any, callback?: (response: any) => void) => {
    if (window.FB) {
      window.FB.ui({
        method: 'share',
        ...options
      }, callback)
    }
  }

  const api = (path: string, method: string = 'GET', params: any = {}, callback?: (response: any) => void) => {
    if (window.FB) {
      window.FB.api(path, method, params, callback)
    }
  }

  return {
    login,
    logout,
    getLoginStatus,
    share,
    api,
    isReady: typeof window !== 'undefined' && !!window.FB
  }
}