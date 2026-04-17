import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Image from 'next/image'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ScrollCompass from '@/components/ScrollCompass'
import SectionAnimations from '@/components/SectionAnimations'

export const metadata: Metadata = {
  title: 'IncomePilot — Your Personal Earnings Operating System',
}

/* ─────────────────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────────────────── */

const modules = [
  {
    tag: 'Shift Work',
    title: 'Every rate, every shift.',
    color: '#3DD6B0',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" opacity="0.6"/>
        <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    bullets: [
      'Penalty rates, multi-rate shifts & allowances',
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
        <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" opacity="0.6"/>
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M12 12v4M10 14h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    bullets: [
      'Job-based logging per client',
      'Pending vs paid invoice tracking',
      'Wages paid to contractors',
      'ABN income tracked automatically',
    ],
  },
  {
    tag: 'Delivery',
    title: 'Know your real net rate.',
    color: '#F59E0B',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M1 3h15v13H1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" opacity="0.6"/>
        <path d="M16 8h4l3 5v3h-7V8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
        <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
      </svg>
    ),
    bullets: [
      'Session-based Uber Eats / DoorDash style logging',
      'Fuel, vehicle & operating cost tracking',
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
        <path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h11l4 4v4h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
        <circle cx="7.5" cy="17.5" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
        <circle cx="17.5" cy="17.5" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
      </svg>
    ),
    bullets: [
      'Trips, hours & platform fee breakdown',
      'Vehicle expense & depreciation',
      'Compare net across platforms',
      'True hourly rate after every cost',
    ],
  },
  {
    tag: 'Rentals',
    title: 'From one item to a full rental business.',
    color: '#FB7185',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.65"/>
        <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    bullets: [
      'Inventory, availability & booking management',
      'Payment status & rental history',
      'Profit per item analytics',
      'Never double-book again',
    ],
  },
]

const comingSoonModules = [
  {
    tag: 'Salary',
    title: 'Fixed recurring income, completed.',
    color: '#34D399',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" opacity="0.5"/>
        <path d="M12 10v4M10 12h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    detail: 'Regular pay cycles, tax withholding, net vs gross — the full picture for salaried workers.',
  },
  {
    tag: 'Investments',
    title: 'Passive growth, tracked.',
    color: '#FBBF24',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 17l4-4 4 2 4-6 4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
        <circle cx="21" cy="13" r="1.5" fill="currentColor" opacity="0.5"/>
      </svg>
    ),
    detail: 'Dividends, returns, and passive income streams — completing your full earnings picture.',
  },
]

const smartFeatures: { icon: ReactNode; title: string; detail: string }[] = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    title: 'Unified Work Hub',
    detail: 'One entry point for every income type. Shared tax logic, insights, and reports across all modules.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
    title: 'One-tap Logging',
    detail: 'Minimal friction. Start a shift, end a session, log a job — in seconds. Advanced mode always available.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    title: 'Goals System',
    detail: 'Set weekly, monthly, or annual targets. CompassInsights calculates effort, pacing, and time to completion.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        <polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
    title: 'Insights & Predictions',
    detail: 'Summaries now. Prediction charts, trend analysis, and actionable prompts rolling in next.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="6"/>
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
      </svg>
    ),
    title: 'Coins, XP & Levels',
    detail: 'Motivation through consistency — not gimmicks. Rewards built around habits that actually matter.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
    ),
    title: 'Smart Notifications',
    detail: 'Contextual, low-frequency, high-relevance. Human tone. Not a spam machine.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" strokeWidth="2"/>
      </svg>
    ),
    title: 'Calendar',
    detail: 'Premium. Past work, upcoming sessions, and forward projections — all in one view.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
        <line x1="2"  y1="20" x2="22" y2="20"/>
      </svg>
    ),
    title: 'Reports & Tax',
    detail: 'AU-first, globally expandable. Clean exportable summaries for PAYG, ABN, or self-employed.',
  },
]

const differentiators = [
  {
    other: 'Most apps track the past',
    us:    'We guide the future',
    detail: 'CompassInsights predicts slow periods, forecasts goal completion, and surfaces what to do next — before you need to ask.',
  },
  {
    other: 'Most apps handle one income type',
    us:    'We unify every stream',
    detail: 'Shifts, freelance, delivery, rideshare, and rentals — one platform that understands how independent workers actually earn.',
  },
  {
    other: 'Most apps show charts',
    us:    'We tell you what to do next',
    detail: 'Insights without action are noise. Every Compass insight surfaces a clear next step tied to your goals.',
  },
]

const philosophySteps = [
  { step: 'Track',      color: '#3DD6B0', detail: 'Every dollar from every stream' },
  { step: 'Understand', color: '#60A5FA', detail: 'Patterns, costs, real net income' },
  { step: 'Predict',    color: '#A78BFA', detail: 'Forecasts, goals, pacing' },
  { step: 'Guide',      color: '#F59E0B', detail: 'Actionable Compass insights' },
  { step: 'Grow',       color: '#FB7185', detail: 'Consistent, compounding progress' },
]

const securityPoints = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2L4 6v6c0 5 3.5 9.7 8 11 4.5-1.3 8-6 8-11V6l-8-4z" stroke="#3DD6B0" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="#3DD6B0" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Local-first data',
    detail: 'Your data lives on your device by default. No forced cloud, no surveillance.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5" y="11" width="14" height="10" rx="2" stroke="#3DD6B0" strokeWidth="1.7"/>
        <path d="M8 11V7a4 4 0 018 0v4" stroke="#3DD6B0" strokeWidth="1.7" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Premium cloud backup',
    detail: 'Premium unlocks secure cloud backup and restore. When those features are active, your data is kept safely backed up to protect your progress.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" stroke="#3DD6B0" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Sync integrity by design',
    detail: 'Data moves through a structured process before reaching any cloud layer — keeping your records consistent and corruption-resistant.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="3" stroke="#3DD6B0" strokeWidth="1.7"/>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" stroke="#3DD6B0" strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
      </svg>
    ),
    title: 'Auditable by design',
    detail: 'IncomePilot is built so that calculations, summaries, and data rules are clean, testable, and independent of the interface.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#3DD6B0" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 8v5" stroke="#3DD6B0" strokeWidth="1.7" strokeLinecap="round"/>
        <circle cx="12" cy="15.5" r="0.8" fill="#3DD6B0"/>
      </svg>
    ),
    title: 'Hardening roadmap',
    detail: 'Encryption at rest, TLS pinning, and session isolation are in the active security pipeline.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="#3DD6B0" strokeWidth="1.7" opacity="0.5"/>
        <path d="M12 8v4l3 3" stroke="#3DD6B0" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Restore & continuity',
    detail: 'Premium users can back up their progress to the cloud. Wipe, reinstall, and restore — your earnings history comes back with you.',
  },
]

/* ─────────────────────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <ScrollCompass />
      <SectionAnimations />

      <main className="flex-1">

        {/* ── 1. HERO ──────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-ip-hero-radial" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(61,214,176,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(61,214,176,0.04) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
              maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 80%)',
            }}
          />

          <div className="section-container relative pt-16 pb-20 sm:pt-20 sm:pb-28 text-center">

            {/* Hero logo mark */}
            <div className="flex justify-center mb-8 animate-fade-in">
              <div className="relative">
                {/* Outer ambient glow */}
                <div
                  aria-hidden="true"
                  className="absolute inset-[-16px] rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(61,214,176,0.18) 0%, transparent 70%)' }}
                />
                {/* Logo ring */}
                <div
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden"
                  style={{
                    border:     '2px solid rgba(61,214,176,0.35)',
                    boxShadow:  '0 0 24px rgba(61,214,176,0.30), 0 0 48px rgba(61,214,176,0.12), inset 0 1px 0 rgba(61,214,176,0.12)',
                    outline:    '4px solid rgba(61,214,176,0.08)',
                    outlineOffset: '3px',
                  }}
                >
                  <Image
                    src="/logo.png"
                    alt="IncomePilot"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Badge */}
            <div className="inline-flex justify-center animate-fade-in">
              <span className="badge">
                <span aria-hidden="true" className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3DD6B0] opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3DD6B0]" />
                </span>
                Launching Soon
              </span>
            </div>

            {/* Headline */}
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-[3.6rem] font-bold tracking-tight leading-[1.1] animate-fade-up delay-100">
              <span className="text-gradient-hero">
                Your Personal<br />
                Earnings Operating System
              </span>
            </h1>

            {/* Four core questions */}
            <div className="mt-6 animate-fade-up delay-200">
              <p className="text-lg sm:text-xl font-semibold text-[#E8F5F2] tracking-tight">
                Work. Earn. Rent. Grow.
              </p>
              <p className="mt-2 text-sm sm:text-base text-[#6E9BAA] max-w-md mx-auto leading-relaxed">
                Not a budgeting app. Not just a tracker.
              </p>
            </div>

            {/* Question pills */}
            <div className="mt-6 flex flex-wrap justify-center gap-2.5 animate-fade-up delay-300">
              {[
                'How much am I really making?',
                "What's coming next?",
                'Am I on track?',
                'Where should I focus?',
              ].map((q) => (
                <span
                  key={q}
                  className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium"
                  style={{
                    background: 'rgba(61,214,176,0.07)',
                    border: '1px solid rgba(61,214,176,0.18)',
                    color: '#C8EDE5',
                  }}
                >
                  {q}
                </span>
              ))}
            </div>

            {/* Store badges */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up delay-400">
              <AppStoreBadge />
              <PlayStoreBadge />
            </div>
            <p className="mt-4 text-xs text-[#3E6474] animate-fade-up delay-500">
              iOS &amp; Android — coming soon
            </p>

            {/* Hero chart */}
            <div className="mt-14 sm:mt-16 mx-auto max-w-lg animate-fade-up delay-500">
              <HeroChart />
            </div>
          </div>
        </section>

        {/* ── 2. PHILOSOPHY STRIP ──────────────────────────────────────── */}
        <section className="py-16 sm:py-20 border-t border-[rgba(255,255,255,0.05)]">
          <div className="section-container">
            <div className="text-center mb-10 reveal">
              <p className="section-eyebrow">Core philosophy</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#E8F5F2]">
                The five-stage intelligence loop
              </h2>
              <p className="mt-2 text-sm text-[#6E9BAA] max-w-lg mx-auto">
                Powered by <span className="text-[#3DD6B0] font-semibold">CompassInsightEngine</span> — the central intelligence layer connecting every module.
              </p>
            </div>

            {/* Steps row */}
            <div className="flex flex-col sm:flex-row items-stretch gap-0 sm:gap-0">
              {philosophySteps.map((s, i) => (
                <div
                  key={s.step}
                  className={`reveal reveal-delay-${i + 1} relative flex-1 flex flex-col items-center text-center px-4 py-6`}
                >
                  {/* Connector arrow — desktop only */}
                  {i < philosophySteps.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10"
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M4 9h10M10 5l4 4-4 4" stroke="rgba(61,214,176,0.35)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-3 text-sm font-bold"
                    style={{
                      background: `${s.color}1A`,
                      border: `1px solid ${s.color}35`,
                      color: s.color,
                    }}
                  >
                    {i + 1}
                  </div>
                  <p className="font-bold text-[#E8F5F2] mb-1">{s.step}</p>
                  <p className="text-xs text-[#6E9BAA] leading-relaxed">{s.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. ARCHITECTURE ──────────────────────────────────────────── */}
        <section className="py-16 sm:py-20">
          <div className="section-container">
            <div className="text-center mb-10 reveal">
              <p className="section-eyebrow">Architecture</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#E8F5F2]">
                Built to be fast, private, and intelligent
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" opacity="0.7"/>
                      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                      <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ),
                  label: 'Local-First',
                  color: '#3DD6B0',
                  points: ['Offline-ready by default', 'Private by design', 'Fast — no network dependency', 'Data lives on your device'],
                  delay: 1,
                },
                {
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 2a10 10 0 110 20A10 10 0 0112 2z" stroke="currentColor" strokeWidth="1.7" opacity="0.4"/>
                      <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                      <path d="M16 16l3 3M5 19l3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>
                    </svg>
                  ),
                  label: 'Optional Cloud Sync',
                  color: '#60A5FA',
                  points: ['Premium backup & restore', 'User-controlled sync', 'Outbox-based — corruption-safe', 'Wipe → restore guarantee'],
                  delay: 2,
                },
                {
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.7"/>
                      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
                      <path d="M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.35"/>
                    </svg>
                  ),
                  label: 'CompassInsightEngine',
                  color: '#A78BFA',
                  points: ['Central intelligence layer', 'Drives all features & goals', 'Prediction + pattern recognition', 'Single source of earnings truth'],
                  delay: 3,
                },
              ].map((col) => (
                <div
                  key={col.label}
                  className={`glass-card glass-card-hover p-6 reveal reveal-delay-${col.delay}`}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 border"
                    style={{
                      background: `${col.color}14`,
                      borderColor: `${col.color}28`,
                      color: col.color,
                    }}
                  >
                    {col.icon}
                  </div>
                  <h3 className="font-bold text-[#E8F5F2] mb-3">{col.label}</h3>
                  <ul className="space-y-2">
                    {col.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-xs text-[#6E9BAA]">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: col.color, opacity: 0.7 }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. MODULES ───────────────────────────────────────────────── */}
        <section className="pb-8 pt-4" id="modules">
          <div className="section-container">
            <div className="text-center mb-10 reveal">
              <p className="section-eyebrow">5 income modules</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#E8F5F2]">
                Built for every way you earn
              </h2>
              <p className="mt-2 text-sm text-[#6E9BAA] max-w-lg mx-auto">
                Whether you work one gig or five — IncomePilot has a dedicated module built around how that income actually works.
              </p>
            </div>

            {/* Top 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {modules.slice(0, 3).map((m, i) => (
                <ModuleCard key={m.tag} module={m} delay={i + 1} />
              ))}
            </div>
            {/* Bottom 2 centred */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:w-2/3 lg:mx-auto mb-8">
              {modules.slice(3).map((m, i) => (
                <ModuleCard key={m.tag} module={m} delay={i + 4} />
              ))}
            </div>

            {/* Coming soon row */}
            <div className="reveal">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
                <span className="text-xs font-semibold text-[#3E6474] uppercase tracking-widest">Coming soon</span>
                <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:w-2/3 lg:mx-auto">
                {comingSoonModules.map((m) => (
                  <div
                    key={m.tag}
                    className="glass-card p-6 flex flex-col gap-3 opacity-60 relative overflow-hidden"
                  >
                    <div
                      aria-hidden="true"
                      className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: 'rgba(255,255,255,0.06)', color: '#4A7A8A', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      Soon
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                        style={{ background: `${m.color}14`, border: `1px solid ${m.color}30`, color: m.color }}
                      >
                        {m.tag}
                      </span>
                      <div
                        className="w-10 h-10 flex items-center justify-center rounded-xl border"
                        style={{ background: `${m.color}10`, borderColor: `${m.color}22`, color: m.color }}
                      >
                        {m.icon}
                      </div>
                    </div>
                    <h3 className="font-semibold text-[#C8EDE5] text-sm leading-snug">{m.title}</h3>
                    <p className="text-xs text-[#4A7A8A] leading-relaxed">{m.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. CALENDAR BAND ─────────────────────────────────────────── */}
        <section className="py-10">
          <div className="section-container">
            <div
              className="glass-card reveal px-6 py-5 sm:px-8 sm:py-6 relative overflow-hidden"
              style={{ background: 'rgba(13,30,42,0.60)', borderColor: 'rgba(61,214,176,0.14)' }}
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 60% 80% at 10% 50%, rgba(61,214,176,0.07) 0%, transparent 70%)' }}
              />
              <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border"
                  style={{ background: 'rgba(61,214,176,0.08)', borderColor: 'rgba(61,214,176,0.22)' }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="#3DD6B0" strokeWidth="1.7" opacity="0.7"/>
                    <path d="M16 2v4M8 2v4M3 10h18" stroke="#3DD6B0" strokeWidth="1.7" strokeLinecap="round"/>
                    <rect x="7" y="14" width="2.5" height="2.5" rx="0.5" fill="#3DD6B0" opacity="0.6"/>
                    <rect x="11" y="14" width="2.5" height="2.5" rx="0.5" fill="#3DD6B0" opacity="0.4"/>
                    <rect x="15" y="14" width="2.5" height="2.5" rx="0.5" fill="#3DD6B0" opacity="0.3"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#E8F5F2] mb-1">One unified calendar — across all 5 modules</p>
                  <p className="text-xs text-[#6E9BAA] leading-relaxed">
                    Shifts, freelance jobs, delivery runs, rideshare trips, and rental bookings all flow into a single integrated calendar. Plan your week, spot gaps, and see exactly what&apos;s earning — at a glance.
                  </p>
                </div>
                <div className="flex-shrink-0 hidden lg:flex flex-col gap-1.5">
                  {['Shift Work','Freelance','Delivery','Rideshare','Rentals'].map((label, i) => {
                    const colors = ['#3DD6B0','#60A5FA','#F59E0B','#A78BFA','#FB7185']
                    return (
                      <div
                        key={label}
                        className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full"
                        style={{ background: `${colors[i]}14`, border: `1px solid ${colors[i]}30`, color: colors[i] }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: colors[i] }} />
                        {label}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. COMPASSINSIGHTS ENGINE ────────────────────────────────── */}
        <section className="pb-20 pt-8">
          <div className="section-container">
            <div className="glass-card border-glow p-8 sm:p-10 relative overflow-hidden">
              <div
                aria-hidden="true"
                className="absolute -right-16 -top-16 w-80 h-80 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(61,214,176,0.10) 0%, transparent 65%)' }}
              />
              <div
                aria-hidden="true"
                className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.07) 0%, transparent 65%)' }}
              />

              <div className="relative grid sm:grid-cols-2 gap-8 items-center">
                <div className="reveal-left">
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(61,214,176,0.10)', border: '1px solid rgba(61,214,176,0.25)', color: '#3DD6B0' }}
                    >
                      Powered by CompassInsights
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#E8F5F2] mb-4">
                    Predicts what&apos;s coming next
                  </h2>
                  <p className="text-[#6E9BAA] leading-relaxed text-sm sm:text-base">
                    CompassInsights learns from every module you use. It reads your earnings history, spots patterns across your shifts, gigs, and rentals, then predicts — not just reports — so you can act before slow periods hit.
                  </p>
                  <ul className="mt-5 space-y-3">
                    {[
                      { label: 'Predicts slow periods before they arrive', sub: 'Based on your historical earning patterns' },
                      { label: "Forecasts if you'll hit your income goal", sub: 'Updated in real time as you earn' },
                      { label: 'Surfaces high-value earning windows', sub: 'Knows when your best shifts & gigs happen' },
                      { label: 'Cross-module income intelligence', sub: 'Learns from shifts, gigs, rentals — all at once' },
                    ].map((item) => (
                      <li key={item.label} className="flex items-start gap-3">
                        <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="flex-shrink-0 mt-0.5">
                          <path d="M2.5 7l3 3 6-6" stroke="#3DD6B0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-[#C8E8E0]">{item.label}</p>
                          <p className="text-xs text-[#4A7A8A] mt-0.5">{item.sub}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-center reveal-right">
                  <CompassVisual />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. SMART FEATURES ────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 border-t border-[rgba(255,255,255,0.05)]">
          <div className="section-container">
            <div className="text-center mb-10 reveal">
              <p className="section-eyebrow">Smart features</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#E8F5F2]">
                Everything you need. Nothing you don&apos;t.
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {smartFeatures.map((f, i) => (
                <div
                  key={f.title}
                  className={`glass-card glass-card-hover p-5 flex flex-col gap-3 reveal reveal-delay-${(i % 4) + 1}`}
                >
                  <div className="feature-icon">{f.icon}</div>
                  <h3 className="font-bold text-[#E8F5F2] text-sm">{f.title}</h3>
                  <p className="text-xs text-[#6E9BAA] leading-relaxed">{f.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 8. SECURITY & PRIVACY ────────────────────────────────────── */}
        <section className="py-16 sm:py-20">
          <div className="section-container">
            <div className="text-center mb-10 reveal">
              <p className="section-eyebrow">Security &amp; Privacy</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#E8F5F2]">
                Your data. Your control.
              </h2>
              <p className="mt-2 text-sm text-[#6E9BAA] max-w-md mx-auto">
                IncomePilot is built local-first and designed so that you — not the platform — decide what leaves your device.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {securityPoints.map((sp, i) => (
                <div
                  key={sp.title}
                  className={`glass-card p-5 flex items-start gap-4 reveal reveal-delay-${(i % 3) + 1}`}
                >
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(61,214,176,0.08)', border: '1px solid rgba(61,214,176,0.18)' }}
                  >
                    {sp.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#C8EDE5] text-sm mb-1">{sp.title}</h3>
                    <p className="text-xs text-[#6E9BAA] leading-relaxed">{sp.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 9. WHAT MAKES US DIFFERENT ───────────────────────────────── */}
        <section className="py-16 sm:py-20 border-t border-[rgba(255,255,255,0.05)]">
          <div className="section-container">
            <div className="text-center mb-10 reveal">
              <p className="section-eyebrow">Why IncomePilot</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#E8F5F2]">
                A unified earnings intelligence platform
              </h2>
            </div>

            <div className="space-y-4">
              {differentiators.map((d, i) => (
                <div
                  key={d.us}
                  className={`glass-card p-6 sm:p-7 relative overflow-hidden reveal reveal-delay-${i + 1}`}
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-50"
                    style={{
                      background: `radial-gradient(ellipse 40% 70% at ${i % 2 === 0 ? '0%' : '100%'} 50%, rgba(61,214,176,0.05) 0%, transparent 70%)`,
                    }}
                  />
                  <div className="relative grid sm:grid-cols-2 gap-4 items-start">
                    {/* Others */}
                    <div className="flex items-start gap-3">
                      <div
                        className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,80,80,0.12)', border: '1px solid rgba(255,80,80,0.20)' }}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                          <path d="M2 2l6 6M8 2L2 8" stroke="rgba(255,100,100,0.7)" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <p className="text-sm text-[#4A7A8A] line-through decoration-[rgba(255,100,100,0.4)]">{d.other}</p>
                    </div>
                    {/* Us */}
                    <div className="flex items-start gap-3">
                      <div
                        className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(61,214,176,0.14)', border: '1px solid rgba(61,214,176,0.28)' }}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                          <path d="M1.5 5l3 3 4-5" stroke="#3DD6B0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#E8F5F2] mb-1">{d.us}</p>
                        <p className="text-xs text-[#6E9BAA] leading-relaxed">{d.detail}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 10. MEET THE TEAM ────────────────────────────────────────── */}
        <section className="py-16 sm:py-20">
          <div className="section-container">
            <div className="text-center mb-10 reveal">
              <p className="section-eyebrow">The team</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#E8F5F2]">
                Built by people who understand independent work
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
              <TeamCard
                initials="JJ"
                name="Jaibin Jose"
                role="Founder &amp; Architect"
                detail="Designed, engineered, and shipped IncomePilot from the ground up — architecture, product, and every line of core logic."
                accentColor="#3DD6B0"
                delay={1}
              />
              <TeamCard
                initials="JJ"
                name="Jerlit Joseph"
                role="Business &amp; Operations"
                detail="Drives go-to-market strategy, partnerships, and the commercial layer that turns great software into a sustainable product."
                accentColor="#60A5FA"
                delay={2}
              />
            </div>
          </div>
        </section>

        {/* ── 11. FINAL CTA ────────────────────────────────────────────── */}
        <section className="pb-28 pt-8">
          <div className="section-container text-center">
            <div className="relative inline-flex flex-col items-center reveal">
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(61,214,176,0.08) 0%, transparent 70%)' }}
              />
              <span className="badge mb-5">Be first to know</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#E8F5F2] max-w-md mb-3">
                IncomePilot is coming soon
              </h2>
              <p className="text-sm text-[#6E9BAA] max-w-sm mx-auto mb-8">
                iOS and Android apps are in final development. Follow along and be first when they land.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <AppStoreBadge />
                <PlayStoreBadge />
              </div>
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

interface ModuleData {
  tag: string
  title: string
  color: string
  icon: ReactNode
  bullets: string[]
}

function ModuleCard({ module: m, delay }: { module: ModuleData; delay: number }) {
  return (
    <div className={`glass-card glass-card-hover p-6 flex flex-col gap-4 reveal reveal-delay-${Math.min(delay, 7)}`}>
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
      <h3 className="font-semibold text-[#E8F5F2] text-base leading-snug">{m.title}</h3>
      <ul className="space-y-2 mt-auto">
        {m.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: m.color, opacity: 0.7 }} />
            <span className="text-xs text-[#6E9BAA] leading-relaxed">{b}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TeamCard({
  initials, name, role, detail, accentColor, delay,
}: {
  initials: string
  name: string
  role: string
  detail: string
  accentColor: string
  delay: number
}) {
  return (
    <div className={`glass-card glass-card-hover p-6 flex flex-col items-center text-center gap-4 reveal reveal-delay-${delay}`}>
      {/* Avatar circle */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, ${accentColor}22 0%, ${accentColor}0A 100%)`,
          border: `2px solid ${accentColor}35`,
          color: accentColor,
        }}
      >
        {initials}
      </div>
      <div>
        <p className="font-bold text-[#E8F5F2] mb-0.5">{name}</p>
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: accentColor }}
          dangerouslySetInnerHTML={{ __html: role }}
        />
        <p className="text-xs text-[#6E9BAA] leading-relaxed">{detail}</p>
      </div>
    </div>
  )
}

function AppStoreBadge() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] px-4 py-2.5 opacity-70 cursor-not-allowed select-none">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-[#E8F5F2]">
        <path
          d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
          fill="currentColor"
        />
      </svg>
      <div className="text-left">
        <div className="text-[9px] text-[#6E9BAA] uppercase tracking-wide leading-none mb-0.5">Coming soon on</div>
        <div className="text-[13px] font-semibold text-[#E8F5F2] leading-none">App Store</div>
      </div>
    </div>
  )
}

function PlayStoreBadge() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] px-4 py-2.5 opacity-70 cursor-not-allowed select-none">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3.18 23.76a2.5 2.5 0 01-1.18-2.2V2.44A2.5 2.5 0 013.18.24l.1-.06L13.72 10.8v.32L3.28 21.82l-.1-.06z" fill="#3DD6B0" opacity="0.8"/>
        <path d="M17.18 14.89l-3.46-3.46V10.5l3.46-3.46 3.9 2.22c1.11.63 1.11 1.66 0 2.29l-3.9 2.34z" fill="#3DD6B0" opacity="0.6"/>
        <path d="M17.64 14.62L13.72 10.7 3.18 21.24a1.29 1.29 0 001.64.08l12.82-6.7z" fill="#3DD6B0" opacity="0.4"/>
        <path d="M17.64 9.5L4.82 2.8A1.29 1.29 0 003.18 2.9l10.54 10.52 3.92-3.92z" fill="#3DD6B0" opacity="0.55"/>
      </svg>
      <div className="text-left">
        <div className="text-[9px] text-[#6E9BAA] uppercase tracking-wide leading-none mb-0.5">Coming soon on</div>
        <div className="text-[13px] font-semibold text-[#E8F5F2] leading-none">Google Play</div>
      </div>
    </div>
  )
}

function HeroChart() {
  const bars = [38, 55, 47, 70, 58, 82, 65, 90, 72, 95, 80, 100]
  return (
    <div className="glass-card border-glow p-5 sm:p-6 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-24 opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(61,214,176,0.35) 0%, transparent 70%)' }}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-[#4A7A8A] font-medium mb-0.5">Income this month</p>
            <p className="text-xl font-bold text-[#E8F5F2]">
              <span className="text-gradient-primary">A$4,820</span>
              <span className="text-xs text-[#3DD6B0] ml-2 font-medium">+12%</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#4A7A8A] font-medium mb-0.5">Goal</p>
            <p className="text-base font-semibold text-[#6E9BAA]">A$5,000</p>
          </div>
        </div>
        <div className="flex items-end gap-1.5 h-20" role="img" aria-label="Earnings chart illustration">
          {bars.map((h, i) => {
            const isLast = i === bars.length - 1
            return (
              <div
                key={i}
                className="flex-1 rounded-sm transition-all"
                style={{
                  height: `${h}%`,
                  background: isLast
                    ? 'linear-gradient(to top, #3DD6B0, #5EE4C0)'
                    : `rgba(61,214,176,${0.10 + (h / 100) * 0.22})`,
                  boxShadow: isLast ? '0 0 12px rgba(61,214,176,0.35)' : 'none',
                }}
              />
            )
          })}
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-[#4A7A8A] mb-1.5">
            <span>Monthly goal progress</span>
            <span className="text-[#3DD6B0] font-semibold">96.4%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: '96.4%', background: 'linear-gradient(90deg, #2A9D8F, #3DD6B0)', boxShadow: '0 0 8px rgba(61,214,176,0.4)' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function CompassVisual() {
  return (
    <div className="relative w-44 h-44 sm:w-56 sm:h-56">
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full animate-[spin_24s_linear_infinite]"
        aria-hidden="true"
      >
        <circle cx="100" cy="100" r="94" stroke="rgba(61,214,176,0.12)" strokeWidth="1" fill="none" strokeDasharray="4 8" />
      </svg>
      <div className="absolute inset-6 rounded-full bg-[rgba(7,15,21,0.9)] border border-[rgba(61,214,176,0.20)] flex items-center justify-center shadow-[0_0_40px_rgba(61,214,176,0.10)]">
        <svg viewBox="0 0 120 120" className="w-full h-full p-4" aria-hidden="true">
          <circle cx="60" cy="60" r="55" fill="none" stroke="rgba(61,214,176,0.08)" strokeWidth="0.8"/>
          <circle cx="60" cy="60" r="36" fill="none" stroke="rgba(61,214,176,0.12)" strokeWidth="0.8"/>
          {Array.from({ length: 72 }, (_, i) => {
            const angle = (i * 5 * Math.PI) / 180
            const isMajor = i % 9 === 0
            const r1 = isMajor ? 46 : 49, r2 = 52
            const x1 = 60 + r1 * Math.sin(angle), y1 = 60 - r1 * Math.cos(angle)
            const x2 = 60 + r2 * Math.sin(angle), y2 = 60 - r2 * Math.cos(angle)
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={`rgba(61,214,176,${isMajor ? 0.35 : 0.12})`} strokeWidth={isMajor ? 1.2 : 0.6} />
          })}
          <path d="M60 60 L56 24 L60 32 L64 24 Z" fill="#3DD6B0"/>
          <path d="M60 60 L57.5 96 L60 88 L62.5 96 Z" fill="rgba(61,214,176,0.28)"/>
          <circle cx="60" cy="60" r="4" fill="#3DD6B0" opacity="0.9"/>
          <circle cx="60" cy="60" r="2" fill="#070F15"/>
        </svg>
      </div>
    </div>
  )
}
