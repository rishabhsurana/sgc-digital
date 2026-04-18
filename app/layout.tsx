import type { Metadata, Viewport } from 'next'
import { Inter, Source_Serif_4 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
});

const sourceSerif = Source_Serif_4({ 
  subsets: ["latin"],
  variable: '--font-source-serif'
});

export const metadata: Metadata = {
  title: 'SGC Digital | Solicitor General\'s Chambers of Barbados',
  description: 'Submit and track Registry Correspondence and Government Contracts through the official SGC Digital Portal - Government of Barbados',
  generator: 'v0.app',
  keywords: ['Barbados', 'Government', 'Solicitor General', 'Contracts', 'Legal', 'Registry'],
}

export const viewport: Viewport = {
  themeColor: '#1a2744',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body className="font-sans antialiased min-h-screen">
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
