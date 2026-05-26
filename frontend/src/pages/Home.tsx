import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { Scissors } from 'lucide-react'
import HomeScene from '@/components/HomeScene'

function SplitTitle({ text }: { text: string }) {
  return (
    <>
      {text.split('').map((char, i) => (
        <span key={i} className="split-char inline-block" style={{ whiteSpace: 'pre' }}>
          {char}
        </span>
      ))}
    </>
  )
}

export default function Home() {
  const sectionRef = useRef<HTMLElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Linha decorativa
      gsap.fromTo(lineRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.4, transformOrigin: 'left center' },
      )

      // SplitText — letras entram uma a uma (sincronizado com zoom da câmera)
      const chars = sectionRef.current!.querySelectorAll('.split-char')
      gsap.fromTo(
        chars,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.04, ease: 'power3.out', delay: 0.55 },
      )

      // Subtítulo e botão entram depois
      gsap.fromTo(
        [subtitleRef.current, btnRef.current],
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.85, stagger: 0.18, ease: 'power3.out', delay: 1.15 },
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{ height: '100vh', position: 'relative', overflow: 'hidden', background: '#080808' }}
    >
      {/* Three.js — PlaneGeometry + shader de profundidade + parallax mouse */}
      <HomeScene />

      {/* Gradiente: #000 (baixo) → transparent (topo) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to top, #000000 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.3) 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Vinheta inset nas bordas */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow:
            'inset 0 0 200px rgba(0,0,0,0.9), inset 0 0 80px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Logo topo esquerdo */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          zIndex: 2,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Scissors size={18} color="#ffffff" />
        </div>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>
          Barbie Pro
        </span>
      </div>

      {/* Conteúdo central-inferior */}
      <div
        style={{
          position: 'absolute',
          bottom: '9%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          width: '100%',
          padding: '0 24px',
          zIndex: 2,
        }}
      >
        {/* Linha prata */}
        <div
          ref={lineRef}
          style={{
            width: 52,
            height: 2,
            background: '#C0C0C0',
            margin: '0 auto 22px',
            transformOrigin: 'left center',
          }}
        />

        <h1
          style={{
            fontSize: 'clamp(52px, 9vw, 108px)',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.03em',
            lineHeight: 1,
            marginBottom: 18,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <SplitTitle text="Barbie Pro" />
        </h1>

        <p
          ref={subtitleRef}
          style={{
            fontSize: 'clamp(11px, 1.3vw, 15px)',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 34,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            opacity: 0,
          }}
        >
          Barbearia de Alto Padrão &nbsp;·&nbsp; Agende Seu Horário
        </p>

        <button
          ref={btnRef}
          onClick={() => navigate('/agendar')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '13px 32px',
            background: '#FFFFFF',
            color: '#0a0a0a',
            fontWeight: 700,
            fontSize: 15,
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '0.02em',
            boxShadow: '0 0 40px rgba(255,255,255,0.15), 0 6px 24px rgba(0,0,0,0.5)',
            opacity: 0,
            transition: 'transform 0.22s ease, box-shadow 0.22s ease',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget
            el.style.transform = 'scale(1.05)'
            el.style.boxShadow = '0 0 60px rgba(255,255,255,0.25), 0 6px 28px rgba(0,0,0,0.5)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget
            el.style.transform = 'scale(1)'
            el.style.boxShadow = '0 0 40px rgba(255,255,255,0.15), 0 6px 24px rgba(0,0,0,0.5)'
          }}
        >
          Agendar Agora
        </button>
      </div>
    </section>
  )
}
