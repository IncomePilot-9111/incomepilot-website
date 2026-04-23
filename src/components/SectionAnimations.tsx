'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * SectionAnimations - null-render client component.
 *
 * Lives in layout.tsx so it never unmounts. Using usePathname as a
 * dependency means the effect re-runs on every client-side navigation,
 * re-observing the freshly rendered .reveal elements on the new page.
 *
 * Without this, navigating away and back leaves all .reveal elements
 * frozen at opacity:0 because the observer was bound to the old
 * (now-destroyed) DOM nodes.
 */
export default function SectionAnimations() {
  const pathname = usePathname()

  useEffect(() => {
    const selectors = '.reveal, .reveal-left, .reveal-right'

    // Small delay lets React finish committing the new page DOM
    const timer = setTimeout(() => {
      const elements = Array.from(document.querySelectorAll<HTMLElement>(selectors))

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              ;(entry.target as HTMLElement).classList.add('revealed')
              observer.unobserve(entry.target)
            }
          })
        },
        {
          threshold:  0.10,
          rootMargin: '0px 0px -32px 0px',
        },
      )

      elements.forEach((el) => observer.observe(el))

      return () => observer.disconnect()
    }, 50)

    return () => clearTimeout(timer)
  }, [pathname])

  return null
}
