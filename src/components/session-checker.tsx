'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// ตัวแปร global เพื่อให้ทุก component share กัน
let globalSessionInvalidated = false

export function SessionChecker() {
  const router = useRouter()
  const [showDialog, setShowDialog] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const checkingRef = useRef(false)
  const lastCheckRef = useRef(Date.now())
  const mountedRef = useRef(true)
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    mountedRef.current = true

    const checkSession = async () => {
      if (checkingRef.current) return false
      
      // Throttle: เช็คได้ไม่เกิน 1 ครั้งต่อ 3 วินาที
      const now = Date.now()
      if (now - lastCheckRef.current < 3000) return true
      lastCheckRef.current = now
      
      try {
        checkingRef.current = true
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        })

        if (res.status === 401) {
          globalSessionInvalidated = true
          if (mountedRef.current) {
            setShowDialog(true)
          }
          return false
        }
        return true
      } catch (error) {
        console.error('Session check error:', error)
        return true
      } finally {
        checkingRef.current = false
      }
    }

    // ถ้า session ถูก invalidate แล้ว แสดงไดอล็อกทันที (แต่ไม่ return ก่อนเวลา)
    if (globalSessionInvalidated) {
      setShowDialog(true)
    }

    // ฟัง localStorage event สำหรับการบังคับออกแบบ cross-tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'session_revoked' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue)
          console.log('Session revoked detected (localStorage):', data)
          
          // ตรวจสอบว่าเป็น session ของตัวเองหรือไม่
          checkSession().then((currentSessionValid) => {
            // ถ้า API ตอบ 401 แสดงว่าเป็น session ของตัวเอง
            if (!currentSessionValid && mountedRef.current) {
              globalSessionInvalidated = true
              setShowDialog(true)
            }
          })
        } catch (err) {
          console.error('Parse session_revoked error:', err)
        }
      }
    }

    // ฟัง BroadcastChannel สำหรับการบังคับออกแบบ real-time (ใช้งานได้ทุก tab)
    let broadcastChannel: BroadcastChannel | null = null
    try {
      broadcastChannel = new BroadcastChannel('session_channel')
      broadcastChannel.onmessage = (event) => {
        if (event.data.type === 'SESSION_REVOKED') {
          console.log('Session revoked detected (BroadcastChannel):', event.data)
          
          // ตรวจสอบว่าเป็น session ของตัวเองหรือไม่
          checkSession().then((currentSessionValid) => {
            // ถ้า API ตอบ 401 แสดงว่าเป็น session ของตัวเอง
            if (!currentSessionValid && mountedRef.current) {
              globalSessionInvalidated = true
              setShowDialog(true)
            }
          })
        }
      }
    } catch (err) {
      console.error('BroadcastChannel not supported:', err)
    }

    // เช็คทันทีเมื่อโหลด (แต่ไม่เช็คถ้า session โดน invalidate แล้ว)
    if (!globalSessionInvalidated) {
      checkSession()
    }

    // เช็คทุก 30 วินาที (ลดลงจาก 2 วินาที)
    const interval = setInterval(() => {
      if (!globalSessionInvalidated) {
        checkSession()
      }
    }, 30000)

    // เช็คเมื่อ window กลับมา focus (เปิด tab กลับมา)
    window.addEventListener('focus', checkSession)
    window.addEventListener('storage', handleStorageChange) // ฟัง localStorage

    // Intercept fetch เพื่อตรวจจับ 401 ทันที (วิธีหลักในการตรวจจับ)
    const originalFetch = window.fetch
    window.fetch = async function(...args) {
      const response = await originalFetch.apply(this, args)
      
      if (response.status === 401 && !args[0].toString().includes('/api/auth/login')) {
        globalSessionInvalidated = true
        if (mountedRef.current) {
          setShowDialog(true)
        }
      }
      
      return response
    }

    return () => {
      mountedRef.current = false
      clearInterval(interval)
      window.removeEventListener('focus', checkSession)
      window.removeEventListener('storage', handleStorageChange)
      window.fetch = originalFetch
      if (broadcastChannel) {
        broadcastChannel.close()
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current)
      }
    }
  }, [])

  // Countdown effect when dialog is shown
  useEffect(() => {
    if (showDialog) {
      setCountdown(5)
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleConfirm()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current)
      }
    }
  }, [showDialog])

  const handleConfirm = () => {
    setShowDialog(false)
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
    }
    // ลบ cookie และ redirect ไป login ทันที
    document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    // ใช้ window.location แทน router.push เพื่อให้แน่ใจว่า redirect ทันที
    window.location.href = '/login'
  }

  return (
    <>
      {/* Backdrop Overlay */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
      )}
      
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="z-[101] max-w-md border-destructive/50 shadow-2xl">
          <AlertDialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center animate-in zoom-in duration-500">
                <div className="text-4xl animate-pulse">⚠️</div>
              </div>
            </div>
            <AlertDialogTitle className="text-center text-2xl font-bold text-destructive">
              ถูกบังคับออกจากระบบ
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 text-center">
              <p className="text-base font-medium text-foreground">
                เซสชันของคุณถูกยกเลิก
              </p>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-left">
                <p className="text-sm font-semibold text-foreground/80">
                  เหตุผลที่เป็นไปได้:
                </p>
                <ul className="text-sm space-y-1.5 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-destructive">•</span>
                    <span>ผู้ดูแลระบบบังคับออกจากระบบ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-destructive">•</span>
                    <span>เข้าสู่ระบบจากอุปกรณ์อื่น</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-destructive">•</span>
                    <span>เซสชันหมดอายุ</span>
                  </li>
                </ul>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                <p className="text-sm font-medium text-primary">
                  🔐 กรุณาเข้าสู่ระบบใหม่เพื่อดำเนินการต่อ
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction 
              onClick={handleConfirm}
              className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
            >
              เข้าสู่ระบบใหม่ {countdown > 0 && `(${countdown})`}
            </AlertDialogAction>
            <p className="text-xs text-center text-muted-foreground">
              จะเปลี่ยนหน้าอัตโนมัติใน {countdown} วินาที
            </p>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
