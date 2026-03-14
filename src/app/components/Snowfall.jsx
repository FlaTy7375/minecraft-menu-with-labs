import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT = 400

export function Snowfall() {
  const geoRef = useRef()

  const { positions, velocities, phases } = useMemo(() => {
    const positions  = new Float32Array(COUNT * 3)
    const velocities = new Float32Array(COUNT)
    const phases     = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = -7 + (Math.random() - 0.5) * 60
      positions[i * 3 + 1] = Math.random() * 22 + 5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60
      velocities[i] = 0.03 + Math.random() * 0.04
      phases[i]     = Math.random() * Math.PI * 2
    }
    return { positions, velocities, phases }
  }, [])

  useFrame(({ clock }) => {
    if (!geoRef.current) return
    const t = clock.getElapsedTime()
    const pos = geoRef.current.attributes.position.array
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 1] -= velocities[i]
      pos[i * 3]      = (-7 + (phases[i] * 3.18) % 22 - 11) + Math.sin(t * 0.5 + phases[i]) * 0.3
      if (pos[i * 3 + 1] < 5) pos[i * 3 + 1] = 27
    }
    geoRef.current.attributes.position.needsUpdate = true
  })

  return (
    <points>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute attach="attributes-position" array={positions} count={COUNT} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#ffffff"
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        fog={false}
      />
    </points>
  )
}
