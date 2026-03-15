import React from 'react'
import { useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import * as THREE from 'three'

useGLTF.setDecoderPath('/draco/')

function QuartzBlock({ onClick, ...props }) {
  const { scene } = useGLTF('/models/minecraft_blocks_collection.glb')
  const clone = React.useMemo(() => {
    const c = SkeletonUtils.clone(scene)
    c.traverse(obj => {
      if (obj.isObject3D && !obj.isMesh) {
        if (obj.name.startsWith('Cube') && obj.name !== 'Cube004_3') {
          obj.visible = false
        }
      }
      if (!obj.isMesh) return
      obj.castShadow = false
      obj.receiveShadow = false
      // Отключаем raycasting на невидимых мешах
      if (obj.parent && !obj.parent.visible) {
        obj.raycast = () => {}
      }
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      mats.forEach(mat => {
        if (mat.map) {
          mat.map.colorSpace = THREE.SRGBColorSpace
          mat.map.needsUpdate = true
        }
      })
    })
    // Отключаем raycast на всех мешах кроме Cube004_3
    c.traverse(obj => {
      if (!obj.isMesh) return
      let isTarget = false
      let cur = obj
      while (cur) {
        if (cur.name === 'Cube004_3') { isTarget = true; break }
        cur = cur.parent
      }
      if (!isTarget) obj.raycast = () => {}
    })
    return c
  }, [scene])

  return (
    <group
      {...props}
      onClick={onClick ? (e) => { e.stopPropagation(); onClick(e) } : undefined}
    >
      <primitive object={clone} dispose={null} />
    </group>
  )
}

export function Model(props) {
  return <QuartzBlock {...props} />
}
