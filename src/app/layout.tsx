import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/next'
import { Rajdhani, Inter } from 'next/font/google'
import './globals.css'
import GlobalBackground from '@/components/GlobalBackground'
import ScrollCompass from '@/components/ScrollCompass'
import SectionAnimations from '@/components/SectionAnimations'

/* ── Fonts ────────────────────────────────────────────────────────────────── */

const rajdhani = Rajdhani({
  weight: ['600', '700'],
  subsets: ['latin'],
  variable: '--font-brand',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

/* ── Metadata ─────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: {
    default: 'Valkoda: Design. Build. Evolve.',
    template: '%s | Valkoda',
  },
  description:
    'Valkoda builds intelligent systems for modern earners. PolarisPilot is our first Pioneer Alpha product.',
  keywords: [
    'Valkoda',
    'PolarisPilot',
    'earnings intelligence',
    'modern earners',
    'Pioneer Alpha',
    'early access',
    'gig economy',
    'independent workers',
  ],
  authors: [{ name: 'Valkoda' }],
  creator: 'Valkoda',
  metadataBase: new URL('https://valkoda.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'Valkoda',
    title: 'Valkoda: Design. Build. Evolve.',
    description:
      'Valkoda builds intelligent systems for modern earners. PolarisPilot is our first Pioneer Alpha product.',
    url: 'https://valkoda.app',
    images: [
      {
        url: '/BANNER.png',
        width: 1920,
        height: 1080,
        alt: 'Valkoda and PolarisPilot banner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Valkoda: Design. Build. Evolve.',
    description:
      'Valkoda builds intelligent systems for modern earners. PolarisPilot is our first Pioneer Alpha product.',
    images: ['/BANNER.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [{ url: '/logo.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/logo.svg'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0C1C28',
}

/* ── Layout ───────────────────────────────────────────────────────────────── */

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`dark ${rajdhani.variable} ${inter.variable}`}>
      <body className="bg-[#0C1C28] text-[#E8F5F2] antialiased">
        {/* Fixed radar/compass texture, behind all pages */}
        <GlobalBackground />
        {/* Scroll-linked compass, on every page */}
        <ScrollCompass />
        {/* Page content, above the fixed background layers */}
        <div className="relative z-[2]">
          {children}
        </div>
        <SectionAnimations />
        <Analytics />
      </body>
    </html>
  )
}
