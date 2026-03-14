import React, { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

export function Model(props) {
  const group = useRef()
  const { scene, animations } = useGLTF('/models/minecraft_chest.glb')

  // Включаем тени на всех мешах
  React.useMemo(() => {
    scene.traverse(obj => {
      if (obj.isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })
  }, [scene])

  const isOpen = useRef(false)
  const lastClickTime = useRef(0)
  const targetTime = useRef(null) // null = не следим

  const mixer = React.useMemo(() => new THREE.AnimationMixer(scene), [scene])

  const action = React.useMemo(() => {
    if (!animations[0]) return null
    const a = mixer.clipAction(animations[0])
    a.setLoop(THREE.LoopOnce, 1)
    a.clampWhenFinished = true
    return a
  }, [mixer, animations])

  useFrame((_, delta) => {
    mixer.update(delta)

    // Следим за достижением целевого времени
    if (action && targetTime.current !== null) {
      const t = action.time
      const target = targetTime.current
      const scale = action.timeScale

      if ((scale > 0 && t >= target) || (scale < 0 && t <= target)) {
        action.paused = true
        targetTime.current = null
      }
    }
  })

  function handleClick(e) {
    e.stopPropagation()
    if (!action) return

    const now = performance.now()
    if (now - lastClickTime.current < 100) return
    lastClickTime.current = now

    const half = action.getClip().duration / 2
    isOpen.current = !isOpen.current

    action.enabled = true
    action.paused = false

    if (isOpen.current) {
      action.timeScale = 1
      action.reset()
      action.play()
      targetTime.current = half
    } else {
      action.timeScale = -1
      action.reset()
      action.time = half
      action.play()
      targetTime.current = 0
    }
  }

  return (
    <group ref={group} {...props} dispose={null} onClick={handleClick}>
      <primitive object={scene} scale={0.01} rotation={[0, -Math.PI / 2, 0]} />
    </group>
  )
}

useGLTF.preload('/models/minecraft_chest.glb')
