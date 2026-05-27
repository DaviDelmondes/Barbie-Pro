import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = dotRef.current!
    const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' })

    function onMove(e: MouseEvent) {
      xTo(e.clientX)
      yTo(e.clientY)
    }

    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      ref={dotRef}
      style={{
        position: 'fixed',
        top: -5,
        left: -5,
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.9)',
        pointerEvents: 'none',
        zIndex: 99999,
        mixBlendMode: 'difference',
        willChange: 'transform',
      }}
    />
  )
}
