import React, { useRef, useImperativeHandle, forwardRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

export const Model = forwardRef(function Model(props, ref) {
  const group = useRef()
  const { scene, animations } = useGLTF('/models/minecraft_chest.glb')

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
  const targetTime = useRef(null)

  const mixer = React.useMemo(() => new THREE.AnimationMixer(scene), [scene])

  const action = React.useMemo(() => {
    if (!animations[0]) return null
    const a = mixer.clipAction(animations[0])
    a.setLoop(THREE.LoopOnce, 1)
    a.clampWhenFinished = true
    return a
  }, [mixer, animations])

  const soundOpen = React.useMemo(() => new Audio('/sounds/open-chest.mp3'), [])
  const soundClose = React.useMemo(() => new Audio('/sounds/close-chest.mp3'), [])

  function openChest() {
    if (!action || isOpen.current) return
    const half = action.getClip().duration / 2
    isOpen.current = true
    action.enabled = true
    action.paused = false
    action.timeScale = 1
    action.reset()
    action.play()
    targetTime.current = half
    soundOpen.currentTime = 0
    soundOpen.play()
  }

  function closeChest() {
    if (!action || !isOpen.current) return
    const half = action.getClip().duration / 2
    isOpen.current = false
    action.enabled = true
    action.paused = false
    action.timeScale = -1
    action.reset()
    action.time = half
    action.play()
    targetTime.current = 0
    soundClose.currentTime = 0
    soundClose.play()
  }

  useImperativeHandle(ref, () => ({ closeChest }))

  useFrame((_, delta) => {
    mixer.update(delta)
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

    if (isOpen.current) {
      closeChest()
      props.onToggle?.(false)
    } else {
      openChest()
      props.onToggle?.(true)
    }
  }

  return (
    <group ref={group} {...props} dispose={null} onClick={handleClick}>
      <primitive object={scene} scale={0.01} rotation={[0, -Math.PI / 2, 0]} />
    </group>
  )
})

useGLTF.preload('/models/minecraft_chest.glb')
