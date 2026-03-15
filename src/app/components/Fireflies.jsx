import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT = 18

export function Fireflies() {
  const groupRef = useRef()

  const glowTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 32; c.height = 32
    const ctx = c.getContext('2d')
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    g.addColorStop(0,   'rgba(80, 255, 30, 1)')
    g.addColorStop(0.3, 'rgba(60, 220, 10, 0.7)')
    g.addColorStop(1,   'rgba(0, 180, 0, 0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 32, 32)
    return new THREE.CanvasTexture(c)
  }, [])

  const flies = useMemo(() => Array.from({ length: COUNT }, (_, i) => ({
    speed:  0.25 + Math.random() * 0.4,
    ox: Math.random() * Math.PI * 2,
    oy: Math.random() * Math.PI * 2,
    oz: Math.random() * Math.PI * 2,
    phase: Math.random() * Math.PI * 2,
    rx: 6 + Math.random() * 6,
    rz: 6 + Math.random() * 6,
    ry: 2 + Math.random() * 3,
    baseY: 7 + Math.random() * 5,
  })), [])

  const refs = useRef([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    flies.forEach((f, i) => {
      const s = refs.current[i]
      if (!s) return
      s.position.x = Math.sin(t * f.speed + f.ox) * f.rx
      s.position.y = f.baseY + Math.sin(t * f.speed * 0.7 + f.oy) * f.ry
      s.position.z = Math.cos(t * f.speed * 0.8 + f.oz) * f.rz
      const flicker = 0.5 + Math.sin(t * 4 + f.phase) * 0.25 + Math.sin(t * 11 + f.phase) * 0.1
      s.material.opacity = Math.max(0.15, flicker)
      const sc = 0.22 + flicker * 0.12
      s.scale.setScalar(sc)
    })
  })

  return (
    <group ref={groupRef}>
      {flies.map((_, i) => (
        <sprite key={i} ref={el => refs.current[i] = el}>
          <spriteMaterial map={glowTex} transparent depthWrite={false} toneMapped={false} />
        </sprite>
      ))}
    </group>
  )
}
