import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import GlobalBackground from '@/components/GlobalBackground'
import ScrollCompass from '@/components/ScrollCompass'

/* ─── Metadata ──────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: {
    default: 'IncomePilot — Earn More. Spend Less. Know More.',
    template: '%s | IncomePilot',
  },
  description:
    'IncomePilot helps shift workers, gig workers, and freelancers track every dollar, plan smart income goals, and surface insights that actually matter.',
  keywords: [
    'income tracker',
    'shift work app',
    'gig economy app',
    'freelance tracker',
    'earnings goals',
    'financial planning',
    'IncomePilot',
  ],
  authors: [{ name: 'IncomePilot' }],
  creator: 'IncomePilot',
  metadataBase: new URL('https://incomepilot.app'),
  openGraph: {
    type: 'website',
    siteName: 'IncomePilot',
    title: 'IncomePilot — Earn More. Spend Less. Know More.',
    description:
      'The income tracking and goal planning app for shifts, gigs, and freelance — with smart insights built in.',
    url: 'https://incomepilot.app',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'IncomePilot',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IncomePilot',
    description: 'Track every dollar. Plan every goal.',
    images: ['/og-image.png'],
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
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#070F15',
}

/* ─── Layout ────────────────────────────────────────────────────────────────── */

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070F15] text-[#E8F5F2] antialiased">
        {/* Fixed radar/compass texture — behind all pages */}
        <GlobalBackground />
        {/* Scroll-linked compass — on every page */}
        <ScrollCompass />
        {/* Page content — above the fixed background layers */}
        <div className="relative z-[2]">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  )
}
