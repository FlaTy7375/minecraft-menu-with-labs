import React from 'react'
import { useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import * as THREE from 'three'

useGLTF.setDecoderPath('/draco/')

function QuartzBlock(props) {
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
    })
    return c
  }, [scene])

  return <primitive object={clone} {...props} dispose={null} />
}

export function Model(props) {
  return <QuartzBlock {...props} />
}
