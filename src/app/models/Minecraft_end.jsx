import React from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

useGLTF.setDecoderPath('/draco/')

export function Model(props) {
  const { scene } = useGLTF('/models/end_city_minecraft.glb')

  React.useMemo(() => {
    scene.traverse(obj => {
      if (!obj.isMesh) return
      obj.castShadow = false
      obj.receiveShadow = false

      // Hide End_Rod — its material uses additive blending causing purple particle effect
      if (obj.name === 'Object_8') {
        obj.visible = false
        return
      }

      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      mats.forEach(mat => {
        if (mat.map) {
          mat.map.colorSpace = THREE.SRGBColorSpace
          mat.map.needsUpdate = true
        }
        mat.emissive?.set(0, 0, 0)
        mat.emissiveMap = null
        mat.emissiveIntensity = 0
        mat.blending = THREE.NormalBlending
        mat.needsUpdate = true
      })
    })
  }, [scene])

  return <primitive object={scene} {...props} dispose={null} />
}
