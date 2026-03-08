'use client'
// FILE: hooks/useCounter.ts
// Animates a number from 0 to target when element enters viewport
// Usage: const { ref, count } = useCounter(28000)

import { useEffect, useRef, useState } from 'react'

export function useCounter(target: number, duration = 2000) {
  const ref = useRef<HTMLDivElement>(null)
  const [count, setCount] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const startTime = performance.now()

          const tick = (now: number) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(eased * target))

            if (progress < 1) {
              requestAnimationFrame(tick)
            }
          }

          requestAnimationFrame(tick)
          observer.unobserve(el)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)

    return () => observer.disconnect()
  }, [target, duration])

  return { ref, count }
}

export default useCounter
