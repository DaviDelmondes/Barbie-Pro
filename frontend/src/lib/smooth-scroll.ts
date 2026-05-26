import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let _lenis: Lenis | null = null

export function initLenis() {
  if (_lenis) return _lenis

  _lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  })

  gsap.ticker.add((time) => _lenis!.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
  _lenis.on('scroll', ScrollTrigger.update)

  return _lenis
}

export function destroyLenis() {
  _lenis?.destroy()
  _lenis = null
}
