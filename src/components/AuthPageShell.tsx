import type { ReactNode } from 'react'
import Logo from '@/components/Logo'

export default function AuthPageShell({
  title,
  subtitle,
  children,
  finePrint,
}: {
  title: string
  subtitle: string
  children: ReactNode
  finePrint?: ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#070F15] flex flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-[420px]"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(61,214,176,0.13) 0%, transparent 65%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(61,214,176,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(61,214,176,0.03) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 75%)',
        }}
      />

      <header className="relative z-10 w-full px-5 py-5 flex justify-center">
        <Logo size="md" />
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#E8F5F2] tracking-tight mb-2">
              {title}
            </h1>
            <p className="text-sm text-[#6E9BAA]">{subtitle}</p>
          </div>

          {children}

          {finePrint ? (
            <p className="text-center text-xs text-[#2E5060] mt-6 leading-relaxed px-4">
              {finePrint}
            </p>
          ) : null}
        </div>
      </main>

      <footer className="relative z-10 text-center py-6">
        <p className="text-xs text-[#2E5060]">
          &copy; {new Date().getFullYear()} IncomePilot. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
