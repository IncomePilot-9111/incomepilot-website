import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'IncomePilot — Earn More. Spend Less. Know More.',
}

/* ─── Module data ───────────────────────────────────────────────────────────── */

const modules = [
  {
    tag: 'Shift Work',
    title: 'Every shift. Every rate.',
    color: '#3DD6B0',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" opacity="0.6"/>
        <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    bullets: [
      'Log shifts with base rates, penalties & allowances',
      'Paid vs unpaid break tracking',
      'Real hourly breakdown per shift',
      'PAYG income summary, tax-ready',
    ],
  },
  {
    tag: 'Freelance',
    title: 'Your freelance business, organised.',
    color: '#60A5FA',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" opacity="0.6"/>
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M12 12v4M10 14h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    bullets: [
      'Track jobs, invoices, and client billing',
      'Log wages paid to contractors or staff',
      'Time-based or flat-rate billing',
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
      'Log every run, tip, and platform earning',
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
        <path d="M15 7l-2-4H6L4 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
      </svg>
    ),
    bullets: [
      'Trips, hours, and platform fee breakdown',
      'Vehicle expense & depreciation tracking',
      'Compare net earnings across platforms',
      'True hourly rate after every cost',
    ],
  },
  {
    tag: 'Rentals & Inventory',
    title: 'Turn your side hustle into a system.',
    color: '#FB7185',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.65"/>
        <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    bullets: [
      'Manage inventory and availability',
      'Track bookings, returns, and earnings',
      'Customer history and rental records',
      'Profit per item — never double-book',
    ],
  },
]

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />

      <main className="flex-1">

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">

          {/* Background glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-ip-hero-radial"
          />
          {/* Subtle grid */}
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

          <div className="section-container relative pt-24 pb-20 sm:pt-32 sm:pb-28 text-center">

            {/* Launch badge */}
            <div className="inline-flex justify-center animate-fade-in">
              <span className="badge">
                <span
                  aria-hidden="true"
                  className="relative flex h-2 w-2"
                >
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3DD6B0] opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3DD6B0]" />
                </span>
                Launching Soon
              </span>
            </div>

            {/* Headline */}
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.12] animate-fade-up delay-100">
              <span className="text-gradient-hero">
                Track every dollar.<br />
                Plan every goal.
              </span>
            </h1>

            {/* Sub */}
            <div className="mt-5 animate-fade-up delay-200">
              <p className="text-lg sm:text-xl font-semibold text-[#E8F5F2] tracking-tight">
                Work. Earn. Rent. Grow.
              </p>
              <p className="mt-1.5 text-base sm:text-lg text-[#6E9BAA]">
                IncomePilot brings it all together.
              </p>
            </div>

            {/* Store badges */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up delay-300">
              <AppStoreBadge />
              <PlayStoreBadge />
            </div>

            <p className="mt-5 text-xs text-[#3E6474] animate-fade-up delay-400">
              iOS &amp; Android — coming soon
            </p>

            {/* Hero visual */}
            <div className="mt-14 sm:mt-16 mx-auto max-w-lg animate-fade-up delay-500">
              <HeroChart />
            </div>
          </div>
        </section>

        {/* ── 5 MODULES ─────────────────────────────────────────────── */}
        <section className="pb-8 pt-4" id="modules">
          <div className="section-container">

            <div className="text-center mb-12">
              <p className="section-eyebrow">5 income modules</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#E8F5F2]">
                Built for every way you earn
              </h2>
              <p className="mt-3 text-sm text-[#6E9BAA] max-w-lg mx-auto">
                Whether you work one gig or five — IncomePilot has a dedicated
                module built around how that income actually works.
              </p>
            </div>

            {/* Top 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {modules.slice(0, 3).map((m, i) => (
                <ModuleCard key={m.tag} module={m} delay={i * 80} />
              ))}
            </div>

            {/* Bottom 2 — centred on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:w-2/3 lg:mx-auto">
              {modules.slice(3).map((m, i) => (
                <ModuleCard key={m.tag} module={m} delay={(i + 3) * 80} />
              ))}
            </div>

          </div>
        </section>

        {/* ── CALENDAR INTEGRATION BAND ─────────────────────────────── */}
        <section className="py-10">
          <div className="section-container">
            <div
              className="glass-card px-6 py-5 sm:px-8 sm:py-6 relative overflow-hidden"
              style={{
                background: 'rgba(13,30,42,0.60)',
                borderColor: 'rgba(61,214,176,0.14)',
              }}
            >
              {/* ambient glow */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse 60% 80% at 10% 50%, rgba(61,214,176,0.07) 0%, transparent 70%)',
                }}
              />
              <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">

                {/* Calendar icon */}
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border"
                  style={{
                    background: 'rgba(61,214,176,0.08)',
                    borderColor: 'rgba(61,214,176,0.22)',
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="#3DD6B0" strokeWidth="1.7" opacity="0.7"/>
                    <path d="M16 2v4M8 2v4M3 10h18" stroke="#3DD6B0" strokeWidth="1.7" strokeLinecap="round"/>
                    <rect x="7" y="14" width="2.5" height="2.5" rx="0.5" fill="#3DD6B0" opacity="0.6"/>
                    <rect x="11" y="14" width="2.5" height="2.5" rx="0.5" fill="#3DD6B0" opacity="0.4"/>
                    <rect x="15" y="14" width="2.5" height="2.5" rx="0.5" fill="#3DD6B0" opacity="0.3"/>
                  </svg>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#E8F5F2] mb-1">
                    One unified calendar — across all 5 modules
                  </p>
                  <p className="text-xs text-[#6E9BAA] leading-relaxed">
                    Your shifts, freelance jobs, delivery runs, rideshare trips, and rental bookings
                    all flow into a single integrated calendar. Plan your week, spot gaps,
                    and see exactly what's earning — at a glance.
                  </p>
                </div>

                {/* Module pills */}
                <div className="flex-shrink-0 hidden lg:flex flex-col gap-1.5">
                  {['Shift Work', 'Freelance', 'Delivery', 'Rideshare', 'Rentals'].map((label, i) => {
                    const colors = ['#3DD6B0', '#60A5FA', '#F59E0B', '#A78BFA', '#FB7185']
                    return (
                      <div
                        key={label}
                        className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full"
                        style={{
                          background: `${colors[i]}14`,
                          border: `1px solid ${colors[i]}30`,
                          color: colors[i],
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: colors[i] }}
                        />
                        {label}
                      </div>
                    )
                  })}
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ── COMPASSINSIGHTS ENGINE ────────────────────────────────── */}
        <section className="pb-24 pt-4">
          <div className="section-container">
            <div className="glass-card border-glow p-8 sm:p-10 relative overflow-hidden">

              {/* bg glow */}
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
                {/* Text */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                      style={{
                        background: 'rgba(61,214,176,0.10)',
                        border: '1px solid rgba(61,214,176,0.25)',
                        color: '#3DD6B0',
                      }}
                    >
                      Powered by CompassInsights
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#E8F5F2] mb-4">
                    Your income engine — predicts what&apos;s coming next
                  </h2>
                  <p className="text-[#6E9BAA] leading-relaxed text-sm sm:text-base">
                    CompassInsights learns from every module you use. It reads your earnings history,
                    spots patterns across your shifts, gigs, and rentals, then predicts — not just
                    reports — so you can act before slow periods hit.
                  </p>
                  <ul className="mt-5 space-y-3">
                    {[
                      { label: 'Predicts slow periods before they arrive', sub: 'Based on your historical earning patterns' },
                      { label: 'Forecasts if you\'ll hit your income goal', sub: 'Updated in real time as you earn' },
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

                {/* Compass visual */}
                <div className="flex justify-center">
                  <CompassVisual />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────────── */}
        <section className="pb-28">
          <div className="section-container text-center">
            <div className="relative inline-flex flex-col items-center">
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
                iOS and Android apps are in final development.
                Follow along and be first when they land.
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

/* ─── Sub-components ────────────────────────────────────────────────────────── */

interface ModuleData {
  tag: string
  title: string
  color: string
  icon: ReactNode
  bullets: string[]
}

function ModuleCard({ module: m, delay }: { module: ModuleData; delay: number }) {
  return (
    <div
      className="glass-card glass-card-hover p-6 flex flex-col gap-4 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Tag + icon row */}
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
          style={{
            background: `${m.color}14`,
            border: `1px solid ${m.color}35`,
            color: m.color,
          }}
        >
          {m.tag}
        </span>
        <div
          className="w-10 h-10 flex items-center justify-center rounded-xl border"
          style={{
            background: `${m.color}12`,
            borderColor: `${m.color}28`,
            color: m.color,
          }}
        >
          {m.icon}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-[#E8F5F2] text-base leading-snug">{m.title}</h3>

      {/* Bullets */}
      <ul className="space-y-2 mt-auto">
        {m.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span
              className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full"
              style={{ background: m.color, opacity: 0.7 }}
            />
            <span className="text-xs text-[#6E9BAA] leading-relaxed">{b}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Coming-soon App Store badge */
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

/** Coming-soon Google Play badge */
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

/** Mini earnings chart illustration */
function HeroChart() {
  const bars = [38, 55, 47, 70, 58, 82, 65, 90, 72, 95, 80, 100]

  return (
    <div className="glass-card border-glow p-5 sm:p-6 relative overflow-hidden">
      {/* glow */}
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

        {/* Bar chart */}
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

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-[#4A7A8A] mb-1.5">
            <span>Monthly goal progress</span>
            <span className="text-[#3DD6B0] font-semibold">96.4%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: '96.4%',
                background: 'linear-gradient(90deg, #2A9D8F, #3DD6B0)',
                boxShadow: '0 0 8px rgba(61,214,176,0.4)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/** Compass dial illustration */
function CompassVisual() {
  return (
    <div className="relative w-44 h-44 sm:w-56 sm:h-56">
      {/* Outer ring */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full animate-[spin_24s_linear_infinite]"
        aria-hidden="true"
      >
        <circle
          cx="100"
          cy="100"
          r="94"
          stroke="rgba(61,214,176,0.12)"
          strokeWidth="1"
          fill="none"
          strokeDasharray="4 8"
        />
      </svg>

      {/* Face */}
      <div className="absolute inset-6 rounded-full bg-[rgba(7,15,21,0.9)] border border-[rgba(61,214,176,0.20)] flex items-center justify-center shadow-[0_0_40px_rgba(61,214,176,0.10)]">
        <svg viewBox="0 0 120 120" className="w-full h-full p-4" aria-hidden="true">
          <circle cx="60" cy="60" r="55" fill="none" stroke="rgba(61,214,176,0.08)" strokeWidth="0.8"/>
          <circle cx="60" cy="60" r="36" fill="none" stroke="rgba(61,214,176,0.12)" strokeWidth="0.8"/>

          {/* Ticks */}
          {Array.from({ length: 72 }, (_, i) => {
            const angle = (i * 5 * Math.PI) / 180
            const isMajor = i % 9 === 0
            const r1 = isMajor ? 46 : 49
            const r2 = 52
            const x1 = 60 + r1 * Math.sin(angle)
            const y1 = 60 - r1 * Math.cos(angle)
            const x2 = 60 + r2 * Math.sin(angle)
            const y2 = 60 - r2 * Math.cos(angle)
            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={`rgba(61,214,176,${isMajor ? 0.35 : 0.12})`}
                strokeWidth={isMajor ? 1.2 : 0.6}
              />
            )
          })}

          {/* North needle */}
          <path d="M60 60 L56 24 L60 32 L64 24 Z" fill="#3DD6B0"/>
          {/* South needle */}
          <path d="M60 60 L57.5 96 L60 88 L62.5 96 Z" fill="rgba(61,214,176,0.28)"/>

          {/* Centre */}
          <circle cx="60" cy="60" r="4" fill="#3DD6B0" opacity="0.9"/>
          <circle cx="60" cy="60" r="2" fill="#070F15"/>
        </svg>
      </div>
    </div>
  )
}
