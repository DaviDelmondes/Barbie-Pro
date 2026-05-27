import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import barberPoleBg from '@/assets/barber-pole.jpeg'

export default function HomeScene() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current!
    const w = window.innerWidth
    const h = window.innerHeight
    const aspect = w / h

    // ── Renderer ──────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x080808)
    mount.appendChild(renderer.domElement)

    // ── Câmera ── começa em z=2.5, zoom cinematic para z=1.8 ─────
    const fov = 60
    const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100)
    camera.position.z = 2.5

    // ── Plano dimensionado para cobrir a tela em z=2.5 ────────────
    const dist = 2.5
    const visH = 2 * Math.tan((fov * Math.PI / 180) / 2) * dist
    const visW = visH * aspect
    const planeW = visW * 1.4
    const planeH = visH * 1.4

    // ── Cena ──────────────────────────────────────────────────────
    const scene = new THREE.Scene()

    // ── Textura barber-pole (cover-fit) ──────────────────────────
    const texture = new THREE.Texture()
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter

    const loader = new THREE.TextureLoader()
    loader.load(barberPoleBg, (tex) => {
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter
      tex.colorSpace = THREE.SRGBColorSpace

      const imgAspect = tex.image.width / tex.image.height
      const vpAspect = window.innerWidth / window.innerHeight

      if (vpAspect > imgAspect) {
        const scale = vpAspect / imgAspect
        tex.repeat.set(1, 1 / scale)
        tex.offset.set(0, (1 - 1 / scale) / 2)
      } else {
        const scale = imgAspect / vpAspect
        tex.repeat.set(1 / scale, 1)
        tex.offset.set((1 - 1 / scale) / 2, 0)
      }

      planeMat.map = tex
      planeMat.needsUpdate = true
    })

    // ── Plano ─────────────────────────────────────────────────────
    const planeGeo = new THREE.PlaneGeometry(planeW, planeH)
    const planeMat = new THREE.MeshBasicMaterial({ map: texture })
    const plane = new THREE.Mesh(planeGeo, planeMat)
    scene.add(plane)

    // ── Partículas brancas/prata ──────────────────────────────────
    const pCount = 100
    const pPos = new Float32Array(pCount * 3)
    const pSpeeds = new Float32Array(pCount)

    for (let i = 0; i < pCount; i++) {
      pPos[i * 3 + 0] = (Math.random() - 0.5) * planeW
      pPos[i * 3 + 1] = (Math.random() - 0.5) * planeH
      pPos[i * 3 + 2] = 0.05 + Math.random() * 0.35
      pSpeeds[i] = 0.0015 + Math.random() * 0.0025
    }

    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    const pMat = new THREE.PointsMaterial({
      color: 0xc8c8c8,
      size: 0.014,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    })
    scene.add(new THREE.Points(pGeo, pMat))

    // ── GSAP zoom cinematic ───────────────────────────────────────
    let wheelEnabled = false
    const zoomTween = gsap.to(camera.position, {
      z: 1.8,
      duration: 3,
      ease: 'power2.out',
      onComplete: () => { wheelEnabled = true },
    })

    // ── Wheel scroll → avança câmera em direção ao poste ─────────
    function onWheel(e: WheelEvent) {
      if (!wheelEnabled) return
      camera.position.z = Math.max(1.0, Math.min(2.5, camera.position.z + e.deltaY * 0.001))
    }
    window.addEventListener('wheel', onWheel, { passive: true })

    // ── Mouse parallax ±15° ───────────────────────────────────────
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    function onMouseMove(e: MouseEvent) {
      targetX = ((e.clientX / window.innerWidth) * 2 - 1) * 0.45
      targetY = -((e.clientY / window.innerHeight) * 2 - 1) * 0.45
    }
    window.addEventListener('mousemove', onMouseMove)

    // ── Loop ──────────────────────────────────────────────────────
    let frameId: number

    function tick() {
      frameId = requestAnimationFrame(tick)

      currentX += (targetX - currentX) * 0.04
      currentY += (targetY - currentY) * 0.04
      camera.position.x = currentX
      camera.position.y = currentY
      camera.lookAt(0, 0, 0)

      const pos = pGeo.attributes.position.array as Float32Array
      for (let i = 0; i < pCount; i++) {
        pos[i * 3 + 1] += pSpeeds[i]
        if (pos[i * 3 + 1] > planeH / 2) pos[i * 3 + 1] = -planeH / 2
      }
      pGeo.attributes.position.needsUpdate = true

      renderer.render(scene, camera)
    }
    tick()

    // ── Resize ────────────────────────────────────────────────────
    function onResize() {
      const nw = window.innerWidth
      const nh = window.innerHeight
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)

    return () => {
      zoomTween.kill()
      cancelAnimationFrame(frameId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', onResize)
      planeGeo.dispose()
      planeMat.dispose()
      pGeo.dispose()
      pMat.dispose()
      texture.dispose()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />
}
