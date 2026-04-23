import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ValkodaWordmark from '@/components/ValkodaWordmark'

export const metadata: Metadata = {
  title: 'Valkoda: Design. Build. Evolve.',
  description:
    'Valkoda builds intelligent systems for modern earners. PolarisPilot is our first Pioneer Alpha product.',
  alternates: {
    canonical: '/',
  },
}


/* ─────────────────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────────────────── */

interface ModuleData {
  tag: string
  title: string
  color: string
  icon: ReactNode
  bullets: string[]
}

const modules: ModuleData[] = [
  {
    tag: 'Shift Work',
    title: 'Every rate, every shift.',
    color: '#3DD6B0',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" opacity="0.6" />
        <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    bullets: [
      'Penalty rates and multi-rate shifts',
      'Paid vs unpaid break tracking',
      'AU award support built in',
      'PAYG income summary, tax-ready',
    ],
  },
  {
    tag: 'Freelance',
    title: 'Job-based. Client-level. Controlled.',
    color: '#60A5FA',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" opacity="0.6" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 12v4M10 14h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    bullets: [
      'Per-client job logging',
      'Invoice tracking: pending and paid',
      'Contractor wages tracked',
      'ABN income handled automatically',
    ],
  },
  {
    tag: 'Delivery',
    title: 'Know your real net rate.',
    color: '#F59E0B',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M1 3h15v13H1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" opacity="0.6" />
        <path d="M16 8h4l3 5v3h-7V8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
    bullets: [
      'Session-based delivery logging',
      'Fuel and vehicle cost tracking',
      'Real net hourly rate per platform',
      'Mileage log for tax deductions',
    ],
  },
  {
    tag: 'Rideshare',
    title: 'What you actually take home.',
    color: '#A78BFA',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h11l4 4v4h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        <circle cx="7.5" cy="17.5" r="2.5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17.5" cy="17.5" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
    bullets: [
      'Trips, hours and platform fee breakdown',
      'Operating costs and depreciation',
      'Earnings compared by week',
      'True hourly rate after every cost',
    ],
  },
  {
    tag: 'Rentals',
    title: 'From one item to a full rental business.',
    color: '#FB7185',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
        <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    bullets: [
      'Item-level tracking and availability',
      'Occupancy and downtime metrics',
      'Rental income per item',
      'Maintenance cost tracking',
    ],
  },
]

const comingSoonModules = [
  {
    tag: 'Salary',
    title: 'Fixed recurring income, completed.',
    color: '#34D399',
    detail: 'Regular pay cycles, tax withholding, net vs gross. The full picture for salaried workers.',
  },
  {
    tag: 'Investments',
    title: 'Passive growth, tracked.',
    color: '#FBBF24',
    detail: 'Dividends, returns, and passive income streams, completing your full earnings picture.',
  },
]

const smartFeatures: { icon: ReactNode; title: string; detail: string }[] = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
    title: 'Goals System',
    detail: 'Set weekly, monthly, or annual targets. PolarisPilot calculates effort, pacing, and time to completion.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    title: 'Insights and Predictions',
    detail: 'Summaries now. Prediction charts, trend analysis, and actionable prompts rolling in next.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: 'One-tap Logging',
    detail: 'Minimal friction. Start a shift, end a session, log a job: done in seconds. Advanced mode always available.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: 'Unified Work Hub',
    detail: 'One entry point for every income type. Shared tax logic, insights, and reports across all modules.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
    title: 'Coins, XP and Levels',
    detail: 'Motivation through consistency, not gimmicks. Rewards built around habits that actually matter.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
    title: 'Smart Notifications',
    detail: 'Contextual, low-frequency, high-relevance. Human tone. Not a spam machine.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" strokeWidth="2" />
      </svg>
    ),
    title: 'Calendar Premium',
    detail: 'Past work, upcoming sessions, and forward projections, all in one view.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6"  y1="20" x2="6"  y2="14" />
        <line x1="2"  y1="20" x2="22" y2="20" />
      </svg>
    ),
    title: 'Reports and Tax',
    detail: 'AU-first, globally expandable. Clean exportable summaries for PAYG, ABN, or self-employed.',
  },
]

const differentiators = [
  {
    other: 'Most apps track the past',
    us:    'We guide the future',
    detail: 'PolarisPilot predicts slow periods, forecasts goal completion, and surfaces what to do next before you need to ask.',
  },
  {
    other: 'Most apps handle one income type',
    us:    'We unify every stream',
    detail: 'Shifts, freelance, delivery, rideshare, and rentals: one platform that understands how independent workers actually earn.',
  },
  {
    other: 'Most apps show charts',
    us:    'We tell you what to do next',
    detail: 'Insights without action are noise. Every Polaris signal surfaces a clear next step tied to your goals.',
  },
]

const securityPoints = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2L4 6v6c0 5 3.5 9.7 8 11 4.5-1.3 8-6 8-11V6l-8-4z" stroke="#3DD6B0" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" stroke="#3DD6B0" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Local-first data',
    detail: 'Your data lives on your device by default. No forced cloud, no surveillance.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5" y="11" width="14" height="10" rx="2" stroke="#3DD6B0" strokeWidth="1.7" />
        <path d="M8 11V7a4 4 0 018 0v4" stroke="#3DD6B0" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
    title: 'Premium cloud backup',
    detail: 'Premium unlocks secure cloud backup and restore. Your progress is kept safely backed up when you need it.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" stroke="#3DD6B0" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Sync integrity',
    detail: 'Data moves through a structured process before reaching any cloud layer, keeping records consistent and corruption-resistant.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="3" stroke="#3DD6B0" strokeWidth="1.7" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" stroke="#3DD6B0" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
      </svg>
    ),
    title: 'Auditable design',
    detail: 'PolarisPilot is built so calculations, summaries, and data rules are clean, testable, and independent of the interface.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#3DD6B0" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 8v5" stroke="#3DD6B0" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="12" cy="15.5" r="0.8" fill="#3DD6B0" />
      </svg>
    ),
    title: 'Hardening roadmap',
    detail: 'Encryption at rest, TLS pinning, and session isolation are in the active security pipeline.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="#3DD6B0" strokeWidth="1.7" opacity="0.5" />
        <path d="M12 8v4l3 3" stroke="#3DD6B0" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Restore and continuity',
    detail: 'Premium users can back up their progress to the cloud. Wipe, reinstall, and restore: your earnings history comes back with you.',
  },
]

/* ─────────────────────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />

      <main className="flex-1">

        {/* ────────────────────────────────────────────────────────────────
            SECTION 1: HERO
        ──────────────────────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center pt-20 pb-16">

          {/* Subtle blue-teal ambient glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 120% 70% at 50% 38%, rgba(41,182,246,0.07) 0%, rgba(61,214,176,0.04) 45%, transparent 75%)',
            }}
          />

          <div className="relative z-10 flex flex-col items-center">

            {/*
              clip-path:circle() cuts the PNG canvas to a circle at pixel level —
              no square corners survive. drop-shadow then traces that circular
              alpha shape, making a square outline physically impossible.
            */}
            <Image
              src="/hero-logo.png"
              alt="PolarisPilot logo"
              width={208}
              height={208}
              priority
              className="animate-fade-in w-44 h-44 sm:w-52 sm:h-52 object-contain"
              style={{
                WebkitMaskImage:
                  'radial-gradient(circle at 50% 50%, black 42%, transparent 52%)',
                maskImage:
                  'radial-gradient(circle at 50% 50%, black 42%, transparent 52%)',
                filter:
                  'drop-shadow(0 0 22px rgba(0,3,8,0.98)) ' +
                  'drop-shadow(0 0 50px rgba(0,4,10,0.85)) ' +
                  'drop-shadow(0 0 90px rgba(1,5,12,0.60)) ' +
                  'drop-shadow(0 0 140px rgba(1,6,14,0.35))',
              }}
            />

            {/* VALKODA wordmark */}
            <div
              className="animate-fade-up delay-100 mt-6"
              style={{
                filter:
                  'drop-shadow(0 1px 0 rgba(0,0,0,0.80)) ' +
                  'drop-shadow(0 2px 0 rgba(0,0,0,0.60)) ' +
                  'drop-shadow(0 3px 0 rgba(0,0,0,0.42)) ' +
                  'drop-shadow(0 5px 14px rgba(0,0,0,0.32))',
              }}
            >
              <ValkodaWordmark
                className="text-[clamp(3.2rem,8vw,6.5rem)] text-[#F5F7FB]"
              />
            </div>

            {/* Tagline */}
            <p className="animate-fade-up delay-200 mt-3 text-[0.72rem] sm:text-[0.8rem] font-semibold uppercase tracking-[0.45em] text-[#3DD6B0]">
              Design. Build. Evolve.
            </p>

            {/* Product intro */}
            <h1 className="animate-fade-up delay-300 mt-8 text-2xl sm:text-3xl font-semibold text-[#F5F7FB]">
              Introducing{' '}
              <span className="text-gradient-primary">PolarisPilot</span>
            </h1>

            {/* Subtext */}
            <p className="animate-fade-up delay-400 mt-3 max-w-lg mx-auto text-base text-[#8CB4C0] leading-relaxed">
              Your personal earnings operating system. Built for independent workers, gig earners, and the self-employed.
            </p>

            {/* Pioneer Alpha badge */}
            <div className="animate-fade-up delay-400 mt-4">
              <span className="badge">
                <span
                  aria-hidden="true"
                  className="inline-block w-1.5 h-1.5 rounded-full bg-[#3DD6B0] opacity-80"
                />
                Pioneer Alpha
              </span>
            </div>

            {/* CTA row */}
            <div className="animate-fade-up delay-500 mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="btn-primary min-w-[200px] justify-center">
                Join Early Access
              </Link>
              <Link href="#polarispilot" className="btn-ghost min-w-[200px] justify-center">
                Discover PolarisPilot
              </Link>
            </div>

            {/* Platform note */}
            <p className="animate-fade-up delay-600 mt-8 text-xs text-[#4A7A8A] tracking-widest uppercase">
              Coming soon on iOS and Android
            </p>

          </div>
        </section>

        {/* ────────────────────────────────────────────────────────────────
            SECTION 2: POLARISPILOT
        ──────────────────────────────────────────────────────────────── */}
        <section id="polarispilot" className="py-28">
          <div className="section-container">
            <div className="text-center mb-12 reveal">
              <p className="section-eyebrow">FIRST PRODUCT</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F7FB] mt-2">
                <span className="text-gradient-primary brand-wordmark tracking-[0.12em]">PolarisPilot</span>
              </h2>
              <p className="mt-4 text-base text-[#8CB4C0] max-w-xl mx-auto leading-relaxed">
                The first product from Valkoda. A complete earnings operating system built to help independent workers track, understand, and grow their income across every stream they work.
              </p>

              {/* Pioneer Alpha status card */}
              <div className="mt-6 inline-flex items-center gap-3 glass-surface px-5 py-3 rounded-full">
                <span
                  aria-hidden="true"
                  className="inline-block w-2 h-2 rounded-full bg-[#3DD6B0] animate-pulse"
                />
                <span className="text-sm font-semibold text-[#3DD6B0] tracking-wide">Pioneer Alpha</span>
                <span className="text-xs text-[#4A7A8A]">Early access. Shape the product.</span>
              </div>
            </div>

            {/* Two-column feature intro grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="glass-surface glass-surface-hover p-7 reveal reveal-delay-1">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 border"
                  style={{ background: 'rgba(61,214,176,0.10)', borderColor: 'rgba(61,214,176,0.22)', color: '#3DD6B0' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" opacity="0.7" />
                    <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#F5F7FB] mb-3">Local-First by Design</h3>
                <p className="text-sm text-[#8CB4C0] leading-relaxed">
                  PolarisPilot stores your earnings data on your device by default. No forced cloud uploads. No surveillance. Fully offline-capable, fast, and private from the ground up.
                </p>
              </div>

              <div className="glass-surface glass-surface-hover p-7 reveal reveal-delay-2">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 border"
                  style={{ background: 'rgba(41,182,246,0.10)', borderColor: 'rgba(41,182,246,0.22)', color: '#29B6F6' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.7" opacity="0.4" />
                    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#F5F7FB] mb-3">Polaris Intelligence</h3>
                <p className="text-sm text-[#8CB4C0] leading-relaxed">
                  The intelligence layer behind every PolarisPilot feature. It reads your earnings history, spots patterns across all modules, predicts slow periods, and surfaces what to do next.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────────────
            SECTION 3: MODULES
        ──────────────────────────────────────────────────────────────── */}
        <section className="py-24">
          <div className="section-container">
            <div className="text-center mb-10 reveal">
              <p className="section-eyebrow">INCOME MODULES</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F7FB] mt-2">
                Built for every way you earn
              </h2>
              <p className="mt-3 text-base text-[#8CB4C0] max-w-lg mx-auto">
                Dedicated modules that understand how independent income actually works.
              </p>
            </div>

            {/* Active modules grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
              {modules.map((m, i) => (
                <ModuleCard key={m.tag} module={m} delay={i + 1} />
              ))}
            </div>

            {/* Coming soon row */}
            <div className="reveal mt-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
                <span className="text-xs font-semibold text-[#3E6474] uppercase tracking-widest">Coming Soon</span>
                <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
              </div>
              <div className="grid sm:grid-cols-2 gap-5 lg:w-2/3 lg:mx-auto">
                {comingSoonModules.map((m) => (
                  <div
                    key={m.tag}
                    className="glass-surface shimmer-placeholder p-6 flex flex-col gap-3 opacity-60 relative overflow-hidden rounded-2xl"
                    style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                        style={{ background: `${m.color}14`, border: `1px solid ${m.color}30`, color: m.color }}
                      >
                        {m.tag}
                      </span>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.06)', color: '#4A7A8A', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        Coming Soon
                      </span>
                    </div>
                    <h3 className="font-semibold text-[#8CB4C0] text-sm leading-snug">{m.title}</h3>
                    <p className="text-xs text-[#4A7A8A] leading-relaxed">{m.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────────────
            SECTION 4: FEATURES
        ──────────────────────────────────────────────────────────────── */}
        <section
          className="py-24"
          style={{ background: 'linear-gradient(180deg, rgba(7,14,19,0) 0%, rgba(41,182,246,0.03) 40%, rgba(61,214,176,0.025) 70%, rgba(7,14,19,0) 100%)' }}
        >
          <div className="section-container">
            <div className="text-center mb-10 reveal">
              <p className="section-eyebrow">FEATURES</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F7FB] mt-2">
                Smart enough to guide you
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {smartFeatures.map((f, i) => (
                <div
                  key={f.title}
                  className={`glass-surface glass-surface-hover p-5 flex flex-col gap-3 reveal reveal-delay-${(i % 4) + 1}`}
                >
                  <div className="feature-icon">{f.icon}</div>
                  <h3 className="font-bold text-[#F5F7FB] text-sm">{f.title}</h3>
                  <p className="text-xs text-[#8CB4C0] leading-relaxed">{f.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────────────
            SECTION 5: DIFFERENTIATORS
        ──────────────────────────────────────────────────────────────── */}
        <section className="py-24">
          <div className="section-container">
            <div className="text-center mb-10 reveal">
              <p className="section-eyebrow">WHY POLARISPILOT</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F7FB] mt-2">
                A different kind of earnings app
              </h2>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {differentiators.map((d, i) => (
                <div
                  key={d.us}
                  className={`glass-surface glass-surface-hover p-7 flex flex-col gap-4 reveal reveal-delay-${i + 1} relative overflow-hidden`}
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(61,214,176,0.05) 0%, transparent 70%)' }}
                  />
                  <div className="relative">
                    <p className="text-xs text-[#4A7A8A] mb-1 font-medium">Others:</p>
                    <p className="text-sm text-[#4A7A8A] line-through decoration-[rgba(255,80,80,0.35)] mb-4">
                      {d.other}
                    </p>
                    <p className="text-xs text-[#3DD6B0] mb-1 font-semibold tracking-wide uppercase">PolarisPilot:</p>
                    <p className="text-base font-bold text-[#F5F7FB] mb-3">{d.us}</p>
                    <p className="text-xs text-[#8CB4C0] leading-relaxed">{d.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────────────
            SECTION 6: SECURITY
        ──────────────────────────────────────────────────────────────── */}
        <section className="py-24 border-t border-[rgba(255,255,255,0.05)]">
          <div className="section-container">
            <div className="text-center mb-10 reveal">
              <p className="section-eyebrow">PRIVACY FIRST</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F7FB] mt-2">
                Your data. Your rules.
              </h2>
              <p className="mt-3 text-base text-[#8CB4C0] max-w-md mx-auto">
                PolarisPilot is built local-first. You decide what leaves your device.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {securityPoints.map((sp, i) => (
                <div
                  key={sp.title}
                  className={`glass-surface p-5 flex items-start gap-4 reveal reveal-delay-${(i % 3) + 1}`}
                >
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(61,214,176,0.08)', border: '1px solid rgba(61,214,176,0.18)' }}
                  >
                    {sp.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#F5F7FB] text-sm mb-1">{sp.title}</h3>
                    <p className="text-xs text-[#8CB4C0] leading-relaxed">{sp.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────────────
            SECTION 7: ABOUT VALKODA
        ──────────────────────────────────────────────────────────────── */}
        <section className="py-24" id="about">
          <div className="section-container">
            <div className="text-center max-w-2xl mx-auto reveal">
              <p className="section-eyebrow">ABOUT VALKODA</p>

              {/* ValkodaMark at medium hero size */}
              <div className="mt-4 mb-5 flex justify-center">
                <ValkodaWordmark
                  className="text-[clamp(2.4rem,5vw,3.8rem)] text-[#F5F7FB]"
                />
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#3DD6B0] mb-6">
                Design. Build. Evolve.
              </p>

              <p className="text-base text-[#8CB4C0] leading-relaxed mb-3">
                Valkoda is a product company. We build intelligent systems for modern earners. PolarisPilot is our first product, and valkoda.app is home to all our products.
              </p>
              <p className="text-base text-[#8CB4C0] leading-relaxed mb-3">
                We believe independent workers deserve the same quality of financial tooling that enterprises have. Clear data, real predictions, and guidance that adapts to how you work.
              </p>
              <p className="text-base text-[#8CB4C0] leading-relaxed">
                We are early. The Pioneer Alpha is live. Come build this with us.
              </p>

              <p className="mt-6 text-xs text-[#3E6474]">
                valkoda.com (our company page) is coming soon.
              </p>
            </div>
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────────────
            SECTION 8: THE TEAM
        ──────────────────────────────────────────────────────────────── */}
        <section className="py-24" id="team">
          <div className="section-container">
            <div className="text-center mb-14 reveal">
              <p className="section-eyebrow">THE TEAM</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F7FB] mt-2 leading-tight">
                Built by people who understand independent work
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">

              {/* Jaibin Jose */}
              <div className="glass-surface glass-surface-hover p-8 flex flex-col items-center text-center gap-4 reveal reveal-delay-1">
                {/* Avatar */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(61,214,176,0.12)',
                    border: '1.5px solid rgba(61,214,176,0.35)',
                  }}
                >
                  <span
                    className="brand-wordmark text-[1.05rem] tracking-widest"
                    style={{ color: '#3DD6B0' }}
                  >
                    JJ
                  </span>
                </div>

                {/* Name + role */}
                <div>
                  <p className="text-[#F5F7FB] font-semibold text-lg leading-snug">Jaibin Jose</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#3DD6B0] mt-1">
                    Founder &amp; Architect
                  </p>
                </div>

                {/* Bio */}
                <p className="text-sm text-[#8CB4C0] leading-relaxed">
                  Designed, engineered, and shipped PolarisPilot from the ground up, across architecture, product, and every line of core logic.
                </p>
              </div>

              {/* Jerlit Joseph */}
              <div className="glass-surface glass-surface-hover p-8 flex flex-col items-center text-center gap-4 reveal reveal-delay-2">
                {/* Avatar */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(41,182,246,0.12)',
                    border: '1.5px solid rgba(41,182,246,0.35)',
                  }}
                >
                  <span
                    className="brand-wordmark text-[1.05rem] tracking-widest"
                    style={{ color: '#29B6F6' }}
                  >
                    JJ
                  </span>
                </div>

                {/* Name + role */}
                <div>
                  <p className="text-[#F5F7FB] font-semibold text-lg leading-snug">Jerlit Joseph</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#29B6F6] mt-1">
                    Business &amp; Operations
                  </p>
                </div>

                {/* Bio */}
                <p className="text-sm text-[#8CB4C0] leading-relaxed">
                  Drives go-to-market strategy, partnerships, and the commercial layer that turns great software into a sustainable product.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────────────
            SECTION 9: FINAL CTA
        ──────────────────────────────────────────────────────────────── */}
        <section className="py-32 relative overflow-hidden">
          {/* Radial teal glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 72% 60% at 50% 50%, rgba(61,214,176,0.10) 0%, rgba(41,182,246,0.06) 40%, transparent 75%)',
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 40% 40% at 50% 50%, rgba(61,214,176,0.06) 0%, transparent 65%)',
            }}
          />

          <div className="section-container relative z-10 text-center">
            <div className="reveal">
              <p className="section-eyebrow mb-4">PIONEER ALPHA</p>
              <h2 className="text-4xl sm:text-5xl font-bold text-[#F5F7FB] mb-4">
                Be first. Pioneer Alpha.
              </h2>
              <p className="text-base text-[#8CB4C0] max-w-md mx-auto mb-10">
                No spam. No obligation. Join early, shape the product.
              </p>
              <Link
                href="/signup"
                className="btn-primary text-base px-10 py-4 rounded-2xl shadow-[0_6px_32px_rgba(61,214,176,0.30)]"
              >
                Join Early Access
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────────────────────── */

function ModuleCard({ module: m, delay }: { module: ModuleData; delay: number }) {
  return (
    <div
      className={`glass-surface glass-surface-hover p-6 flex flex-col gap-4 reveal reveal-delay-${Math.min(delay, 7)} relative overflow-hidden`}
      style={{ borderTopWidth: '2px', borderTopColor: m.color, borderTopStyle: 'solid' }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
          style={{ background: `${m.color}14`, border: `1px solid ${m.color}35`, color: m.color }}
        >
          {m.tag}
        </span>
        <div
          className="w-10 h-10 flex items-center justify-center rounded-xl border"
          style={{ background: `${m.color}12`, borderColor: `${m.color}28`, color: m.color }}
        >
          {m.icon}
        </div>
      </div>
      <h3 className="font-semibold text-[#F5F7FB] text-base leading-snug">{m.title}</h3>
      <ul className="space-y-2 mt-auto">
        {m.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span
              className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full"
              style={{ background: m.color, opacity: 0.7 }}
            />
            <span className="text-xs text-[#8CB4C0] leading-relaxed">{b}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
