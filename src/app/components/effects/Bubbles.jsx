import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT = 120

export function Bubbles() {
  const ref = useRef()

  const { positions, speeds, offsets } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const speeds = new Float32Array(COUNT)
    const offsets = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 30  // x
      positions[i * 3 + 1] = Math.random() * 20           // y — стартовая высота
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30  // z
      speeds[i]  = 0.5 + Math.random() * 1.5
      offsets[i] = Math.random() * Math.PI * 2
    }
    return { positions, speeds, offsets }
  }, [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    const pos = ref.current.geometry.attributes.position.array

    for (let i = 0; i < COUNT; i++) {
      // Поднимаем вверх
      pos[i * 3 + 1] += speeds[i] * 0.01
      // Лёгкое покачивание по X
      pos[i * 3 + 0] += Math.sin(t * 0.8 + offsets[i]) * 0.003

      // Сброс когда улетел вверх
      if (pos[i * 3 + 1] > 25) {
        pos[i * 3 + 1] = 0
        pos[i * 3 + 0] = (Math.random() - 0.5) * 30
        pos[i * 3 + 2] = (Math.random() - 0.5) * 30
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#0066cc"
        transparent
        opacity={0.6}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}
