'use client'

import { useEffect, useRef, useCallback } from 'react'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const mousePos = useRef({ x: -100, y: -100 })
  const ringPos = useRef({ x: -100, y: -100 })
  const rafRef = useRef<number>(0)

  const animate = useCallback(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    ringPos.current.x = lerp(ringPos.current.x, mousePos.current.x, 0.12)
    ringPos.current.y = lerp(ringPos.current.y, mousePos.current.y, 0.12)

    if (dotRef.current) {
      dotRef.current.style.transform = `translate(${mousePos.current.x - 5}px, ${mousePos.current.y - 5}px)`
    }
    if (ringRef.current) {
      ringRef.current.style.transform = `translate(${ringPos.current.x - 18}px, ${ringPos.current.y - 18}px)`
    }
    rafRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
    }

    const onMouseEnterInteractive = () => {
      if (ringRef.current) {
        ringRef.current.style.width = '56px'
        ringRef.current.style.height = '56px'
        ringRef.current.style.borderColor = 'var(--gold-light)'
        ringRef.current.style.opacity = '0.8'
      }
    }

    const onMouseLeaveInteractive = () => {
      if (ringRef.current) {
        ringRef.current.style.width = '36px'
        ringRef.current.style.height = '36px'
        ringRef.current.style.borderColor = 'var(--gold)'
        ringRef.current.style.opacity = '0.5'
      }
    }

    const interactiveSelectors = 'a, button, [role="button"], input, select, textarea, label'

    const addListeners = () => {
      document.querySelectorAll(interactiveSelectors).forEach((el) => {
        el.addEventListener('mouseenter', onMouseEnterInteractive)
        el.addEventListener('mouseleave', onMouseLeaveInteractive)
      })
    }

    window.addEventListener('mousemove', onMouseMove)
    addListeners()
    rafRef.current = requestAnimationFrame(animate)

    // Observe DOM for new interactive elements
    const observer = new MutationObserver(addListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafRef.current)
      observer.disconnect()
    }
  }, [animate])

  return (
    <>
      {/* Gold dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: 'var(--gold)',
          zIndex: 9999,
          pointerEvents: 'none',
          mixBlendMode: 'difference',
          willChange: 'transform',
          transition: 'width 0.2s, height 0.2s',
        }}
      />
      {/* Ring with lerp lag */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '1px solid var(--gold)',
          opacity: 0.5,
          zIndex: 9998,
          pointerEvents: 'none',
          willChange: 'transform',
          transition: 'width 0.3s ease, height 0.3s ease, border-color 0.3s ease, opacity 0.3s ease',
        }}
      />
    </>
  )
}
