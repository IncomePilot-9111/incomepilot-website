import Link from 'next/link'
import Logo from './Logo'

const year = new Date().getFullYear()

const footerLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use',   href: '/terms'   },
  { label: 'Support',        href: '/support' },
]

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.06)] bg-[rgba(7,15,21,0.6)]">
      <div className="section-container py-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          {/* Brand */}
          <div className="flex flex-col items-center sm:items-start gap-2">
            <Logo size="sm" />
            <p className="text-xs text-[#3E6474] mt-1 text-center sm:text-left">
              Built for the way independent workers earn.
            </p>
          </div>

          {/* Links */}
          <nav aria-label="Footer navigation" className="flex flex-wrap justify-center sm:justify-end gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-[#4A7A8A] hover:text-[#3DD6B0] transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom row */}
        <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.05)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#2E5060]">
            &copy; {year} IncomePilot. All rights reserved.
          </p>
          <p className="text-xs text-[#2E5060]">
            incomepilot.app
          </p>
        </div>
      </div>
    </footer>
  )
}
