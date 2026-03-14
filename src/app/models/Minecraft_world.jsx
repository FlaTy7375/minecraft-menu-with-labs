import React from 'react'
import { useGLTF } from '@react-three/drei'

export function Model(props) {
  const { scene } = useGLTF('/models/minecraft_world.glb')

  React.useMemo(() => {
    scene.traverse(obj => {
      if (obj.isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })
  }, [scene])

  return <primitive object={scene} {...props} dispose={null} />
}

// Загружается лениво — только при первом рендере
