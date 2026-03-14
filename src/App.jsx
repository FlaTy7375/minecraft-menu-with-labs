import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { Suspense, useEffect } from 'react'
import * as THREE from 'three'
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js'
import { Model as World } from './app/models/Minecraft_world'
import { Model as Chest } from './app/models/Minecraft-chest'
import { CloudSky } from './CloudSky'

const SUN_POSITION = new THREE.Vector3(-100, 25, 50)

function SunFlare() {
  const { scene } = useThree()

  useEffect(() => {
    const makeCircle = (size, color) => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
      grad.addColorStop(0, color)
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, size, size)
      return new THREE.CanvasTexture(canvas)
    }

    const lensflare = new Lensflare()
    lensflare.addElement(new LensflareElement(makeCircle(256, 'rgba(255,160,40,1)'),  800, 0))
    lensflare.addElement(new LensflareElement(makeCircle(128, 'rgba(255,80,0,0.8)'),  350, 0.3))
    lensflare.addElement(new LensflareElement(makeCircle(64,  'rgba(200,50,0,0.5)'),  180, 0.7))

    const light = new THREE.PointLight(0xff8030, 0)
    light.position.copy(SUN_POSITION)
    light.add(lensflare)
    scene.add(light)

    return () => scene.remove(light)
  }, [scene])

  return null
}

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        shadows
        camera={{ position: [0, 10, 7], fov: 70 }}
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 2.2,
          outputColorSpace: THREE.SRGBColorSpace,
          powerPreference: 'high-performance',
        }}
      >
        <CloudSky />

        <directionalLight
          position={SUN_POSITION}
          intensity={8}
          color="#ff7000"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={0.1}
          shadow-camera-far={200}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
          shadow-bias={-0.0005}
          shadow-radius={4}
        />

        <hemisphereLight args={['#ff9040', '#3a1000', 1.8]} />
        <SunFlare />

        <Suspense fallback={null}>
          <World scale={50} position={[0, 0, 0]} />
          <Chest position={[0, 7.4, 0]} />

        </Suspense>
        <OrbitControls target={[0, 7.4, 0]} maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  )
}

export default App
