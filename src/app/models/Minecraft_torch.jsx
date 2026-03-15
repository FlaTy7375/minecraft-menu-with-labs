import React from 'react'
import { useGLTF } from '@react-three/drei'

export function Model(props) {
  const { scene } = useGLTF('/models/minecraft_torch.glb')

  React.useMemo(() => {
    scene.traverse(obj => {
      if (!obj.isMesh) return
      obj.castShadow = false
      obj.receiveShadow = false
    })
  }, [scene])

  // Вычисляем позицию макушки: модель Y от -1 до 9, scale=0.13
  // В локальных координатах макушка на Y=9, при scale=0.13 → 9*0.13=1.17 выше origin
  // props.position = [1.8, 6.4, 3], значит макушка в мире на Y = 6.4 + 1.17 = 7.57
  // Но нам нужна позиция относительно group, т.е. просто Y=9 в локальных единицах
  return (
    <group {...props}>
      <primitive object={scene} dispose={null} />
      {/* Светящийся куб поверх макушки факела */}
      <mesh position={[0, 9, 0]}>
        <boxGeometry args={[2.2, 2.2, 2.2]} />
        <meshStandardMaterial
          color="#cc9900"
          emissive="#aa7700"
          emissiveIntensity={3}
          toneMapped={false}
          transparent
          opacity={0.92}
        />
      </mesh>
    </group>
  )
}

// Загружается лениво — только при первом рендере
