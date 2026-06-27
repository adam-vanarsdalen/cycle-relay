import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Cycle Relay — IVF Communication Assistant',
  description:
    'Generates compassionate, stage-specific patient messages for IVF coordinators after Cycle Clarity delivers monitoring results to the physician.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#0B1628] text-[#F8FAFC] antialiased font-sans">
        {children}
      </body>
    </html>
  )
}
