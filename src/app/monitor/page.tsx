'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function MonitorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLeftOpen, setIsLeftOpen] = useState(true)
  const [isRightOpen, setIsRightOpen] = useState(true)
  const [activeTab, setActiveTab] = useState(1)
  const [mounted, setMounted] = useState(false)

  const tabs = [
    { id: 1, name: 'แท็ป 1', slug: 'tab1' },
    { id: 2, name: 'แท็ป 2', slug: 'tab2' },
    { id: 3, name: 'แท็ป 3', slug: 'tab3' },
  ]

  // Load saved state from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const savedLeftOpen = localStorage.getItem('monitor-leftOpen')
    const savedRightOpen = localStorage.getItem('monitor-rightOpen')
    
    if (savedLeftOpen !== null) {
      setIsLeftOpen(savedLeftOpen === 'true')
    }
    if (savedRightOpen !== null) {
      setIsRightOpen(savedRightOpen === 'true')
    }
  }, [])

  // Read tab from URL on mount
  useEffect(() => {
    if (!mounted) return
    
    const tabParam = searchParams.get('tab')
    if (tabParam) {
      const foundTab = tabs.find(t => t.slug === tabParam)
      if (foundTab) {
        setActiveTab(foundTab.id)
        localStorage.setItem('monitor-activeTab', String(foundTab.id))
      }
    } else {
      // If no URL param, check localStorage and update URL
      const savedTab = localStorage.getItem('monitor-activeTab')
      if (savedTab) {
        const tabId = parseInt(savedTab)
        setActiveTab(tabId)
        const tab = tabs.find(t => t.id === tabId)
        if (tab) {
          router.replace(`/monitor?tab=${tab.slug}`, { scroll: false })
        }
      } else {
        // Default to first tab
        router.replace(`/monitor?tab=${tabs[0].slug}`, { scroll: false })
      }
    }
  }, [searchParams, mounted])

  // Save left panel state to localStorage
  const handleLeftToggle = (newState: boolean) => {
    setIsLeftOpen(newState)
    localStorage.setItem('monitor-leftOpen', String(newState))
  }

  // Save right panel state to localStorage
  const handleRightToggle = (newState: boolean) => {
    setIsRightOpen(newState)
    localStorage.setItem('monitor-rightOpen', String(newState))
  }

  // Update URL when tab changes and save to localStorage
  const handleTabChange = (tabId: number) => {
    setActiveTab(tabId)
    localStorage.setItem('monitor-activeTab', String(tabId))
    const tab = tabs.find(t => t.id === tabId)
    if (tab) {
      router.push(`/monitor?tab=${tab.slug}`, { scroll: false })
    }
  }

  return (
    <div className="h-full flex gap-4 relative">
      {/* Left Card - เล็ก */}
      <div className={cn(
        "transition-all duration-300 flex-shrink-0 h-full relative",
        isLeftOpen ? "w-64" : "w-0"
      )}>
        <Card className={cn(
          "h-full transition-all duration-300",
          "bg-white/30 dark:bg-black/30 backdrop-blur-xl border-white/20",
          "shadow-xl",
          isLeftOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <CardContent className="h-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">เมนูซ้าย</h2>
            </div>
            {/* เนื้อหาเพิ่มเติมตรงนี้ */}
          </CardContent>
        </Card>
        
        {/* Toggle Button for Left Card */}
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full",
            "bg-white/40 dark:bg-black/40 backdrop-blur-xl border-white/20",
            "shadow-lg hover:bg-white/60 dark:hover:bg-black/60",
            !isLeftOpen && "-right-10"
          )}
          onClick={() => handleLeftToggle(!isLeftOpen)}
        >
          {isLeftOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      {/* Center Card - กว้าง (เมนูหลัก) */}
      <Card className={cn(
        "flex-1 h-full flex flex-col overflow-hidden",
        "bg-white/30 dark:bg-black/30 backdrop-blur-xl border-white/20",
        "shadow-xl"
      )}>
        {/* Tabs Header */}
        <div className="flex gap-0 border-b border-white/20 bg-white/20 dark:bg-black/20 flex-shrink-0">
          <button
            onClick={() => handleTabChange(1)}
            className={cn(
              "px-6 py-3 text-sm font-medium transition-all relative whitespace-nowrap",
              "hover:text-primary hover:bg-white/10 dark:hover:bg-white/5",
              activeTab === 1
                ? "border-b-2 border-primary text-primary -mb-[1px]"
                : "text-foreground/60"
            )}
          >
            แท็ป 1
          </button>
          <button
            onClick={() => handleTabChange(2)}
            className={cn(
              "px-6 py-3 text-sm font-medium transition-all relative whitespace-nowrap",
              "hover:text-primary hover:bg-white/10 dark:hover:bg-white/5",
              activeTab === 2
                ? "border-b-2 border-primary text-primary -mb-[1px]"
                : "text-foreground/60"
            )}
          >
            แท็ป 2
          </button>
          <button
            onClick={() => handleTabChange(3)}
            className={cn(
              "px-6 py-3 text-sm font-medium transition-all relative whitespace-nowrap",
              "hover:text-primary hover:bg-white/10 dark:hover:bg-white/5",
              activeTab === 3
                ? "border-b-2 border-primary text-primary -mb-[1px]"
                : "text-foreground/60"
            )}
          >
            แท็ป 3
          </button>
        </div>

        {/* Tabs Content */}
        <CardContent className="flex-1 p-6 overflow-auto">
          {activeTab === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Monitor - แท็ป 1</h2>
              <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5 dark:bg-black/5 backdrop-blur-2xl shadow-2xl">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5 dark:hover:bg-white/5 bg-white/10 dark:bg-black/10 backdrop-blur-xl">
                      <TableHead className="w-[100px] font-semibold">รหัส</TableHead>
                      <TableHead className="font-semibold">ชื่อ</TableHead>
                      <TableHead className="font-semibold">สถานะ</TableHead>
                      <TableHead className="text-right font-semibold">จำนวน</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-white/10 hover:bg-white/5 dark:hover:bg-white/5 backdrop-blur-xl">
                      <TableCell className="font-medium">001</TableCell>
                      <TableCell>รายการ A</TableCell>
                      <TableCell>
                        <span className="px-3 py-1 text-xs rounded-full bg-green-500/20 text-green-600 dark:text-green-400 backdrop-blur-xl border border-green-500/30 shadow-sm">
                          ใช้งาน
                        </span>
                      </TableCell>
                      <TableCell className="text-right">100</TableCell>
                    </TableRow>
                    <TableRow className="border-white/10 hover:bg-white/5 dark:hover:bg-white/5 backdrop-blur-xl">
                      <TableCell className="font-medium">002</TableCell>
                      <TableCell>รายการ B</TableCell>
                      <TableCell>
                        <span className="px-3 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 backdrop-blur-xl border border-yellow-500/30 shadow-sm">
                          รอดำเนินการ
                        </span>
                      </TableCell>
                      <TableCell className="text-right">250</TableCell>
                    </TableRow>
                    <TableRow className="border-white/10 hover:bg-white/5 dark:hover:bg-white/5 backdrop-blur-xl">
                      <TableCell className="font-medium">003</TableCell>
                      <TableCell>รายการ C</TableCell>
                      <TableCell>
                        <span className="px-3 py-1 text-xs rounded-full bg-green-500/20 text-green-600 dark:text-green-400 backdrop-blur-xl border border-green-500/30 shadow-sm">
                          ใช้งาน
                        </span>
                      </TableCell>
                      <TableCell className="text-right">75</TableCell>
                    </TableRow>
                    <TableRow className="border-white/10 hover:bg-white/5 dark:hover:bg-white/5 backdrop-blur-xl">
                      <TableCell className="font-medium">004</TableCell>
                      <TableCell>รายการ D</TableCell>
                      <TableCell>
                        <span className="px-3 py-1 text-xs rounded-full bg-red-500/20 text-red-600 dark:text-red-400 backdrop-blur-xl border border-red-500/30 shadow-sm">
                          ปิดใช้งาน
                        </span>
                      </TableCell>
                      <TableCell className="text-right">0</TableCell>
                    </TableRow>
                    <TableRow className="border-white/10 hover:bg-white/5 dark:hover:bg-white/5 backdrop-blur-xl">
                      <TableCell className="font-medium">005</TableCell>
                      <TableCell>รายการ E</TableCell>
                      <TableCell>
                        <span className="px-3 py-1 text-xs rounded-full bg-green-500/20 text-green-600 dark:text-green-400 backdrop-blur-xl border border-green-500/30 shadow-sm">
                          ใช้งาน
                        </span>
                      </TableCell>
                      <TableCell className="text-right">320</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          {activeTab === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Monitor - แท็ป 2</h2>
              <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5 dark:bg-black/5 backdrop-blur-2xl shadow-2xl">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5 dark:hover:bg-white/5 bg-white/10 dark:bg-black/10 backdrop-blur-xl">
                      <TableHead className="font-semibold">วันที่</TableHead>
                      <TableHead className="font-semibold">เวลา</TableHead>
                      <TableHead className="font-semibold">รายละเอียด</TableHead>
                      <TableHead className="text-right font-semibold">ผลลัพธ์</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-white/10 hover:bg-white/5 dark:hover:bg-white/5 backdrop-blur-xl">
                      <TableCell>8 พ.ย. 2568</TableCell>
                      <TableCell>09:30</TableCell>
                      <TableCell>ข้อมูลตัวอย่าง 1</TableCell>
                      <TableCell className="text-right">
                        <span className="text-green-600 dark:text-green-400 font-medium">สำเร็จ</span>
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-white/10 hover:bg-white/5 dark:hover:bg-white/5 backdrop-blur-xl">
                      <TableCell>7 พ.ย. 2568</TableCell>
                      <TableCell>14:15</TableCell>
                      <TableCell>ข้อมูลตัวอย่าง 2</TableCell>
                      <TableCell className="text-right">
                        <span className="text-green-600 dark:text-green-400 font-medium">สำเร็จ</span>
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-white/10 hover:bg-white/5 dark:hover:bg-white/5 backdrop-blur-xl">
                      <TableCell>7 พ.ย. 2568</TableCell>
                      <TableCell>10:00</TableCell>
                      <TableCell>ข้อมูลตัวอย่าง 3</TableCell>
                      <TableCell className="text-right">
                        <span className="text-yellow-600 dark:text-yellow-400 font-medium">รอดำเนินการ</span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          {activeTab === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Monitor - แท็ป 3</h2>
              <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5 dark:bg-black/5 backdrop-blur-2xl shadow-2xl">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5 dark:hover:bg-white/5 bg-white/10 dark:bg-black/10 backdrop-blur-xl">
                      <TableHead className="w-[80px] font-semibold">ลำดับ</TableHead>
                      <TableHead className="font-semibold">หัวข้อ</TableHead>
                      <TableHead className="font-semibold">ประเภท</TableHead>
                      <TableHead className="text-right font-semibold">คะแนน</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-white/10 hover:bg-white/5 dark:hover:bg-white/5 backdrop-blur-xl">
                      <TableCell className="font-medium">1</TableCell>
                      <TableCell>หัวข้อที่ 1</TableCell>
                      <TableCell>ประเภท A</TableCell>
                      <TableCell className="text-right">95</TableCell>
                    </TableRow>
                    <TableRow className="border-white/10 hover:bg-white/5 dark:hover:bg-white/5 backdrop-blur-xl">
                      <TableCell className="font-medium">2</TableCell>
                      <TableCell>หัวข้อที่ 2</TableCell>
                      <TableCell>ประเภท B</TableCell>
                      <TableCell className="text-right">88</TableCell>
                    </TableRow>
                    <TableRow className="border-white/10 hover:bg-white/5 dark:hover:bg-white/5 backdrop-blur-xl">
                      <TableCell className="font-medium">3</TableCell>
                      <TableCell>หัวข้อที่ 3</TableCell>
                      <TableCell>ประเภท A</TableCell>
                      <TableCell className="text-right">92</TableCell>
                    </TableRow>
                    <TableRow className="border-white/10 hover:bg-white/5 dark:hover:bg-white/5 backdrop-blur-xl">
                      <TableCell className="font-medium">4</TableCell>
                      <TableCell>หัวข้อที่ 4</TableCell>
                      <TableCell>ประเภท C</TableCell>
                      <TableCell className="text-right">78</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right Card - เท่ากับอันแรก */}
      <div className={cn(
        "transition-all duration-300 flex-shrink-0 h-full relative",
        isRightOpen ? "w-64" : "w-0"
      )}>
        <Card className={cn(
          "h-full transition-all duration-300",
          "bg-white/30 dark:bg-black/30 backdrop-blur-xl border-white/20",
          "shadow-xl",
          isRightOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <CardContent className="h-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">เมนูขวา</h2>
            </div>
            {/* เนื้อหาเพิ่มเติมตรงนี้ */}
          </CardContent>
        </Card>
        
        {/* Toggle Button for Right Card */}
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "absolute -left-3 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full",
            "bg-white/40 dark:bg-black/40 backdrop-blur-xl border-white/20",
            "shadow-lg hover:bg-white/60 dark:hover:bg-black/60",
            !isRightOpen && "-left-10"
          )}
          onClick={() => handleRightToggle(!isRightOpen)}
        >
          {isRightOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
