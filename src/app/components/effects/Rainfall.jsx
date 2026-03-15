import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT = 800
const DROP_LEN = 1.2  // длина полоски

export function Rainfall() {
  const geoRef = useRef()

  const { positions, velocities } = useMemo(() => {
    // LineSegments: каждая капля = 2 вершины (начало и конец)
    const positions  = new Float32Array(COUNT * 6)
    const velocities = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      const x = -7 + (Math.random() - 0.5) * 55
      const y = Math.random() * 30 + 5
      const z = (Math.random() - 0.5) * 55
      positions[i * 6]     = x
      positions[i * 6 + 1] = y
      positions[i * 6 + 2] = z
      positions[i * 6 + 3] = x
      positions[i * 6 + 4] = y - DROP_LEN
      positions[i * 6 + 5] = z
      velocities[i] = 0.3 + Math.random() * 0.2
    }
    return { positions, velocities }
  }, [])

  useFrame(() => {
    if (!geoRef.current) return
    const pos = geoRef.current.attributes.position.array
    for (let i = 0; i < COUNT; i++) {
      pos[i * 6 + 1] -= velocities[i]
      pos[i * 6 + 4] -= velocities[i]
      if (pos[i * 6 + 4] < 5) {
        const x = -7 + (Math.random() - 0.5) * 55
        const z = (Math.random() - 0.5) * 55
        const y = 35
        pos[i * 6]     = x
        pos[i * 6 + 1] = y
        pos[i * 6 + 2] = z
        pos[i * 6 + 3] = x
        pos[i * 6 + 4] = y - DROP_LEN
        pos[i * 6 + 5] = z
      }
    }
    geoRef.current.attributes.position.needsUpdate = true
  })

  return (
    <lineSegments>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute attach="attributes-position" array={positions} count={COUNT * 2} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial color="#b8ccd8" transparent opacity={0.45} depthWrite={false} fog={false} />
    </lineSegments>
  )
}
