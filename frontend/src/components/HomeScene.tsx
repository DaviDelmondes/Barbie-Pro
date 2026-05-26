import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import barbershopBg from '@/assets/barbershop.jpeg'

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
    renderer.setClearColor(0x0a0a0a)
    mount.appendChild(renderer.domElement)

    // ── Câmera ────────────────────────────────────────────────────
    const fov = 60
    const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100)
    camera.position.z = 2

    // ── Plano: tamanho baseado no que a câmera vê em z=0 ─────────
    // Altura visível = 2 * tan(fov/2) * distância
    const dist = 2
    const visH = 2 * Math.tan((fov * Math.PI / 180) / 2) * dist
    const visW = visH * aspect
    // 25% extra para o parallax não mostrar borda
    const planeW = visW * 1.25
    const planeH = visH * 1.25

    // ── Cena ──────────────────────────────────────────────────────
    const scene = new THREE.Scene()

    // ── Textura ───────────────────────────────────────────────────
    const texture = new THREE.Texture()
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter

    const loader = new THREE.TextureLoader()
    loader.load(barbershopBg, (tex) => {
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter
      tex.colorSpace = THREE.SRGBColorSpace

      // Cover: ajusta repeat/offset para não distorcer a foto
      const imgAspect = tex.image.width / tex.image.height
      const vpAspect = window.innerWidth / window.innerHeight

      if (vpAspect > imgAspect) {
        // viewport mais largo que a imagem → recorta altura
        const scale = vpAspect / imgAspect
        tex.repeat.set(1, 1 / scale)
        tex.offset.set(0, (1 - 1 / scale) / 2)
      } else {
        // viewport mais alto que a imagem → recorta largura
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

    // ── Partículas âmbar ──────────────────────────────────────────
    const pCount = 80
    const pPos = new Float32Array(pCount * 3)
    const pSpeeds = new Float32Array(pCount)

    for (let i = 0; i < pCount; i++) {
      pPos[i * 3 + 0] = (Math.random() - 0.5) * planeW
      pPos[i * 3 + 1] = (Math.random() - 0.5) * planeH
      pPos[i * 3 + 2] = 0.05 + Math.random() * 0.3
      pSpeeds[i] = 0.002 + Math.random() * 0.003
    }

    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    const pMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.02,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    })
    scene.add(new THREE.Points(pGeo, pMat))

    // ── Mouse parallax ────────────────────────────────────────────
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    function onMouseMove(e: MouseEvent) {
      targetX = ((e.clientX / window.innerWidth) * 2 - 1) * 0.3
      targetY = -((e.clientY / window.innerHeight) * 2 - 1) * 0.3
    }
    window.addEventListener('mousemove', onMouseMove)

    // ── Loop ──────────────────────────────────────────────────────
    let frameId: number

    function tick() {
      frameId = requestAnimationFrame(tick)

      // Lerp suave da câmera seguindo o mouse
      currentX += (targetX - currentX) * 0.05
      currentY += (targetY - currentY) * 0.05
      camera.position.x = currentX
      camera.position.y = currentY
      camera.lookAt(0, 0, 0)

      // Partículas flutuam para cima
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
      cancelAnimationFrame(frameId)
      window.removeEventListener('mousemove', onMouseMove)
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
