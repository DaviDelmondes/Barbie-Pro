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

      // Letras entram com blur 10px → 0px (efeito cinematográfico)
      const chars = sectionRef.current!.querySelectorAll('.split-char')
      gsap.fromTo(
        chars,
        { y: 60, opacity: 0, filter: 'blur(10px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.0, stagger: 0.05, ease: 'power3.out', delay: 0.5 },
      )

      // Subtítulo entra depois
      gsap.fromTo(subtitleRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out', delay: 1.3 },
      )

      // Botão entra e depois pulsa suavemente em loop
      gsap.fromTo(btnRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.85, ease: 'power3.out', delay: 1.5,
          onComplete: () => {
            gsap.to(btnRef.current, {
              scale: 1.03,
              duration: 1.6,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
            })
          },
        },
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{ height: '100vh', position: 'relative', overflow: 'hidden', background: '#080808' }}
    >
      {/* Three.js — câmera imersiva + parallax + zoom no scroll */}
      <HomeScene />

      {/* Gradiente de profundidade */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.25) 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Vinheta nas 4 bordas */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: 'inset 0 0 220px rgba(0,0,0,0.95), inset 0 0 80px rgba(0,0,0,0.5)',
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
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
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
            marginBottom: 20,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <SplitTitle text="Barbie Pro" />
        </h1>

        <p
          ref={subtitleRef}
          style={{
            fontSize: 'clamp(11px, 1.3vw, 15px)',
            color: 'rgba(255,255,255,0.45)',
            marginBottom: 36,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            opacity: 0,
            fontWeight: 300,
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
            padding: '14px 36px',
            background: '#FFFFFF',
            color: '#080808',
            fontWeight: 700,
            fontSize: 15,
            borderRadius: 14,
            border: 'none',
            letterSpacing: '0.02em',
            boxShadow: '0 0 40px rgba(255,255,255,0.18), 0 8px 28px rgba(0,0,0,0.6)',
            opacity: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = '0 0 60px rgba(255,255,255,0.3), 0 8px 32px rgba(0,0,0,0.6)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = '0 0 40px rgba(255,255,255,0.18), 0 8px 28px rgba(0,0,0,0.6)'
          }}
        >
          Agendar Agora
        </button>
      </div>
    </section>
  )
}
