import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function usePageAnimation() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const ctx = gsap.context(() => {
      // Entrada da página — header e elementos marcados
      gsap.from('[data-animate]', {
        y: 28,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.09,
        clearProps: 'all',
      })

      // Cards revelados no scroll
      const scrollEls = ref.current!.querySelectorAll('[data-scroll]')
      scrollEls.forEach((el) => {
        gsap.from(el, {
          y: 36,
          opacity: 0,
          duration: 0.65,
          ease: 'power3.out',
          clearProps: 'all',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
          },
        })
      })
    }, ref)

    return () => ctx.revert()
  }, [])

  return ref
}
