import React from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

useGLTF.setDecoderPath('/draco/')

export function Model(props) {
  const { scene } = useGLTF('/models/ocean_monument__minecraft.glb')

  React.useMemo(() => {
    scene.traverse(obj => {
      if (!obj.isMesh) return
      obj.castShadow = false
      obj.receiveShadow = false
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      mats.forEach(mat => {
        // Скрываем оригинальную воду — заменим своей
        if (mat.name === 'Stationary_Water') {
          obj.visible = false
          return
        }
        if (mat.map) {
          mat.map.colorSpace = THREE.SRGBColorSpace
          mat.map.needsUpdate = true
        }
        mat.needsUpdate = true
      })
    })
  }, [scene])

  return <primitive object={scene} {...props} dispose={null} />
}
