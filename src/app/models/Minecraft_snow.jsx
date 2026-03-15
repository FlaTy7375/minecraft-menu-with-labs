import React from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

useGLTF.setDecoderPath('/draco/')

export function Model(props) {
  const { scene } = useGLTF('/models/snow.glb')

  React.useMemo(() => {
    scene.traverse(obj => {
      if (!obj.isMesh) return
      obj.castShadow = false
      obj.receiveShadow = false
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      mats.forEach(mat => {
        if (mat.map) {
          mat.map.colorSpace = THREE.SRGBColorSpace
          mat.map.needsUpdate = true
        }
        if (mat.transparent || mat.alphaTest > 0) {
          mat.transparent = false
          mat.alphaTest = 0.1
          mat.depthWrite = true
          mat.side = THREE.DoubleSide
        } else {
          mat.transparent = false
          mat.opacity = 1
          mat.depthWrite = true
        }
        mat.needsUpdate = true
      })
    })
  }, [scene])

  return <primitive object={scene} {...props} dispose={null} />
}

// Загружается лениво — только при первом рендере
