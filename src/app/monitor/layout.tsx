import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Monitor - ads169th System',
  description: 'ระบบ Monitor',
}

export default function MonitorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
