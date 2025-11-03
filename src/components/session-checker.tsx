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
  const checkingRef = useRef(false)
  const lastCheckRef = useRef(Date.now())
  const mountedRef = useRef(true)

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
              
              // ลบ cookie และ redirect ไป login ทันที (หลังจาก 2 วินาทีเพื่อให้เห็น dialog)
              setTimeout(() => {
                document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                window.location.href = '/login'
              }, 2000)
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
              
              // ลบ cookie และ redirect ไป login ทันที (หลังจาก 2 วินาทีเพื่อให้เห็น dialog)
              setTimeout(() => {
                document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                window.location.href = '/login'
              }, 2000)
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
    }
  }, [])

  const handleConfirm = () => {
    setShowDialog(false)
    // ลบ cookie และ redirect ไป login ทันที
    document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    // ใช้ window.location แทน router.push เพื่อให้แน่ใจว่า redirect ทันที
    window.location.href = '/login'
  }

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            ⚠️ ถูกบังคับออกจากระบบ
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>เซสชันของคุณถูกยกเลิกโดยผู้ดูแลระบบ</p>
            <p className="text-sm">
              เหตุผลที่เป็นไปได้:
            </p>
            <ul className="text-sm list-disc list-inside space-y-1 text-muted-foreground">
              <li>ผู้ดูแลระบบบังคับออกจากระบบ</li>
              <li>เข้าสู่ระบบจากอุปกรณ์อื่น</li>
              <li>เซสชันหมดอายุ</li>
            </ul>
            <p className="text-sm mt-4">
              กรุณาเข้าสู่ระบบใหม่อีกครั้ง
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleConfirm}>
            เข้าสู่ระบบใหม่
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
