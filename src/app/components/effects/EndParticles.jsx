import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT = 40

export function EndParticles() {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() => Array.from({ length: COUNT }, () => ({
    x: (Math.random() - 0.5) * 30,
    y: 5 + Math.random() * 15,
    z: (Math.random() - 0.5) * 30,
    vx: (Math.random() - 0.5) * 0.015,
    vy: 0.01 + Math.random() * 0.025,
    vz: (Math.random() - 0.5) * 0.015,
    age: Math.random() * 4,
    maxAge: 3 + Math.random() * 4,
    size: 0.06 + Math.random() * 0.08,
  })), [])

  useFrame(({ camera }, delta) => {
    if (!meshRef.current) return
    particles.forEach((p, i) => {
      p.age += delta
      if (p.age > p.maxAge) {
        p.x = (Math.random() - 0.5) * 30
        p.y = 5 + Math.random() * 3
        p.z = (Math.random() - 0.5) * 30
        p.vx = (Math.random() - 0.5) * 0.015
        p.vy = 0.01 + Math.random() * 0.025
        p.vz = (Math.random() - 0.5) * 0.015
        p.age = 0
        p.maxAge = 3 + Math.random() * 4
      } else {
        p.x += p.vx
        p.y += p.vy
        p.z += p.vz
      }
      dummy.position.set(p.x, p.y, p.z)
      dummy.scale.setScalar(p.size)
      dummy.quaternion.copy(camera.quaternion)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, COUNT]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="#aa44ff" toneMapped={false} transparent opacity={0.85} />
    </instancedMesh>
  )
}
