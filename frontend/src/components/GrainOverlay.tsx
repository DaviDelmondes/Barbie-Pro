import { useEffect, useRef } from 'react'

export default function GrainOverlay() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current!
    const size = 512
    c.width = size
    c.height = size
    const ctx = c.getContext('2d')!
    const d = ctx.createImageData(size, size)
    for (let i = 0; i < d.data.length; i += 4) {
      const v = Math.floor(Math.random() * 255)
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v
      d.data[i + 3] = 255
    }
    ctx.putImageData(d, 0, 0)
  }, [])

  return (
    <canvas
      ref={ref}
      style={{
        position: 'fixed',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        pointerEvents: 'none',
        zIndex: 9998,
        opacity: 0.038,
        animation: 'grain 0.75s steps(2) infinite',
        willChange: 'transform',
      }}
    />
  )
}
