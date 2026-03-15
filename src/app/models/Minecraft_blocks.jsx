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
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      mats.forEach(mat => {
        if (mat.map) {
          mat.map.colorSpace = THREE.SRGBColorSpace
          mat.map.needsUpdate = true
        }
      })
      let isTarget = false
      let cur = obj
      while (cur) { if (cur.name === 'Cube004_3') { isTarget = true; break } cur = cur.parent }
      if (!isTarget) obj.raycast = () => {}
    })
    return c
  }, [scene])

  return (
    <group
      {...props}
      onClick={onClick ? (e) => { e.stopPropagation(); onClick(e) } : undefined}
      onPointerOver={onClick ? () => { document.body.style.cursor = 'pointer' } : undefined}
      onPointerOut={onClick ? () => { document.body.style.cursor = 'auto' } : undefined}
    >
      <primitive object={clone} dispose={null} />
    </group>
  )
}

export function Model(props) {
  return <QuartzBlock {...props} />
}
