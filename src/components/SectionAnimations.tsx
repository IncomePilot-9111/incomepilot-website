'use client'

import { useEffect } from 'react'

/**
 * SectionAnimations — null-render client component.
 *
 * Sets up a single IntersectionObserver that watches every element
 * carrying a .reveal, .reveal-left, or .reveal-right class and adds
 * the .revealed class when they enter the viewport, triggering the
 * CSS transition defined in globals.css.
 *
 * Import this once in the page (not layout) so it only runs when
 * the home page mounts.
 */
export default function SectionAnimations() {
  useEffect(() => {
    const selectors = '.reveal, .reveal-left, .reveal-right'
    const elements  = Array.from(document.querySelectorAll<HTMLElement>(selectors))

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
        threshold:   0.10,
        rootMargin:  '0px 0px -32px 0px',
      },
    )

    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return null
}
