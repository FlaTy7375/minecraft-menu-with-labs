import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT = 60

export function LavaParticles() {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() => Array.from({ length: COUNT }, () => ({
    x: (Math.random() - 0.5) * 25,
    y: 6 + Math.random() * 2,
    z: (Math.random() - 0.5) * 25,
    vx: (Math.random() - 0.5) * 0.02,
    vy: 0.02 + Math.random() * 0.05,
    vz: (Math.random() - 0.5) * 0.02,
    age: Math.random() * 3,
    maxAge: 1.5 + Math.random() * 2.5,
    size: 0.08 + Math.random() * 0.1,
  })), [])

  useFrame(({ camera }, delta) => {
    if (!meshRef.current) return
    particles.forEach((p, i) => {
      p.age += delta
      if (p.age > p.maxAge) {
        p.x = (Math.random() - 0.5) * 25
        p.y = 6 + Math.random() * 1
        p.z = (Math.random() - 0.5) * 25
        p.vx = (Math.random() - 0.5) * 0.02
        p.vy = 0.02 + Math.random() * 0.05
        p.vz = (Math.random() - 0.5) * 0.02
        p.age = 0
        p.maxAge = 1.5 + Math.random() * 2.5
      } else {
        p.x += p.vx
        p.y += p.vy
        p.z += p.vz
        p.vy -= 0.001
      }
      dummy.position.set(p.x, p.y, p.z)
      dummy.scale.setScalar(p.size)
      // Billboard — всегда смотрит на камеру
      dummy.quaternion.copy(camera.quaternion)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, COUNT]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="#ff6600" toneMapped={false} />
    </instancedMesh>
  )
}
