import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ADS169 - ads169th System',
  description: 'ระบบ ADS169',
}

export default function ADS169Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
