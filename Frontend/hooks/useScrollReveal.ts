'use client'
// FILE: hooks/useScrollReveal.ts
// IntersectionObserver hook for scroll animations
// Usage: const ref = useScrollReveal()  OR  useScrollReveal(0, 100 * index)

import { useEffect, useRef } from 'react'

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.15,
  delayMs = 0
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    el.classList.add('reveal')

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.classList.add('visible')
          }, delayMs)
          observer.unobserve(el)
        }
      },
      { threshold }
    )

    observer.observe(el)

    return () => observer.disconnect()
  }, [threshold, delayMs])

  return ref
}

export default useScrollReveal
