import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { Suspense, useEffect, useState, useRef, useMemo } from 'react'
import * as THREE from 'three'
import { Model as World } from './app/models/Minecraft_world'
import { Model as Desert } from './app/models/Minecraft_dessert'
import { Model as Snow } from './app/models/Minecraft_snow'
import { Model as Torch } from './app/models/Minecraft_torch'
import { Model as Chest } from './app/models/Minecraft-chest'
import { CloudSky } from './app/textures/CloudSky'
import { DesertSky } from './app/textures/DesertSky'
import { SnowSky } from './app/textures/SnowSky'
import { Snowfall } from './app/components/Snowfall'
import { ChestInventory } from './app/components/ChestInventory/ChestInventory'
import { MusicPlayer } from './app/components/music/MusicPlayer'
import { StartScreen } from './app/components/StartScreen/StartScreen'

const SUNSET_SUN = new THREE.Vector3(-100, 25, 50)
const DESERT_SUN = new THREE.Vector3(-100, 20, 40)
const MOON_POS   = new THREE.Vector3(-80, 80, -80)

// Позиция камеры: в пустыне сундук повёрнут -90° по Y, значит "спереди" — со стороны +X
const CAM_DEFAULT = new THREE.Vector3(0, 10, 7)
const CAM_DESERT  = new THREE.Vector3(-7, 10, 0)
const CAM_SNOW    = new THREE.Vector3(-7, 10, 0)

function CameraController({ activeWorld, controlsRef }) {
  const { camera } = useThree()
  const animating = useRef(false)
  const targetPos = useRef(new THREE.Vector3(...CAM_DEFAULT))
  const prevWorld = useRef(null)

  const camForWorld = (w) => {
    if (w === 'desert') return CAM_DESERT
    if (w === 'snow') return CAM_SNOW
    return CAM_DEFAULT
  }
  useFrame(() => {
    if (prevWorld.current !== activeWorld) {
      prevWorld.current = activeWorld
      targetPos.current.copy(camForWorld(activeWorld))
      animating.current = true
      if (controlsRef.current) controlsRef.current.enabled = false
    }

    if (!animating.current) return

    camera.position.lerp(targetPos.current, 0.15)
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 7.4, 0)
      controlsRef.current.update()
    }
    if (camera.position.distanceTo(targetPos.current) < 0.01) {
      camera.position.copy(targetPos.current)
      animating.current = false
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 7.4, 0)
        controlsRef.current.update()
        controlsRef.current.enabled = true
      }
    }
  })

  return null
}

function SunFlare() {
  return null
}

function TorchGlow() {
  const spriteRef = useRef()
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64; canvas.height = 64
    const ctx = canvas.getContext('2d')
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0,   'rgba(255, 220, 120, 1)')
    grad.addColorStop(0.2, 'rgba(255, 120, 20, 0.9)')
    grad.addColorStop(0.5, 'rgba(255, 50, 0, 0.5)')
    grad.addColorStop(1,   'rgba(255, 20, 0, 0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 64, 64)
    return new THREE.CanvasTexture(canvas)
  }, [])

  useFrame(({ clock }) => {
    if (!spriteRef.current) return
    const t = clock.getElapsedTime()
    const f = 1.0 + Math.sin(t * 9.1) * 0.1 + Math.sin(t * 23.7) * 0.05 + Math.random() * 0.03
    spriteRef.current.scale.setScalar(0.9 * f)
  })

  return (
    <sprite ref={spriteRef} position={[1.8, 7.58, 3]}>
      <spriteMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </sprite>
  )
}


function TorchLight() {
  const lightRef = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const flicker = 1.0
      + Math.sin(t * 9.1) * 0.12
      + Math.sin(t * 23.7) * 0.06
      + Math.sin(t * 4.3) * 0.08
    if (lightRef.current) lightRef.current.intensity = 10.0 * flicker
  })
  const torchPos = [1.8, 7.48, 3]
  return (
    <pointLight ref={lightRef} position={torchPos} color="#ff7700" intensity={10} distance={35} decay={1.2} castShadow={false} />
  )
}

function ToneMappingUpdater({ activeWorld }) {
  const { gl } = useThree()
  useEffect(() => {
    if (activeWorld === 'desert') gl.toneMappingExposure = 1.0
    else if (activeWorld === 'snow') gl.toneMappingExposure = 1.3
    else gl.toneMappingExposure = 2.2
  }, [activeWorld, gl])
  return null
}

function SceneLighting({ activeWorld }) {
  const isDesert = activeWorld === 'desert'
  const isSnow   = activeWorld === 'snow'
  const sunPos   = isDesert ? DESERT_SUN : isSnow ? MOON_POS : SUNSET_SUN

  return (
    <>
      {isDesert ? <DesertSky /> : isSnow ? <SnowSky /> : <CloudSky />}

      <directionalLight
        position={sunPos}
        intensity={isDesert ? 5 : isSnow ? 0 : 8}
        color={isDesert ? '#ffffff' : isSnow ? '#c8d8ff' : '#ff7000'}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={200}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0005}
      />

      {isDesert
        ? <hemisphereLight args={['#87ceeb', '#c2a060', 1.5]} />
        : isSnow
          ? <>
              <hemisphereLight args={['#1a2540', '#0a0f1e', 1.2]} />
              <ambientLight intensity={0.15} color="#2a3555" />
            </>
          : <hemisphereLight args={['#ff9040', '#3a1000', 1.8]} />
      }

      {!isDesert && !isSnow && <SunFlare />}
      {isSnow && (
        <>
          <Snowfall />
          <fog attach="fog" args={['#0a0f1e', 60, 140]} />
        </>
      )}
    </>
  )
}

function App() {
  const [chestOpen, setChestOpen] = useState(false)
  const [started, setStarted] = useState(false)
  const [activeWorld, setActiveWorld] = useState('default')
  const chestRef = useRef()
  const controlsRef = useRef()

  function handleSelectWorld(world) {
    setActiveWorld(world)
    handleClose()
  }

  function handleClose() {
    setChestOpen(false)
    chestRef.current?.closeChest()
  }

  const isDesert = activeWorld === 'desert'

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Canvas
        shadows
        camera={{ position: [0, 10, 7], fov: 70 }}
        dpr={Math.min(window.devicePixelRatio, 1.5)}
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: isDesert ? 1.0 : 2.2,
          outputColorSpace: THREE.SRGBColorSpace,
          powerPreference: 'high-performance',
          antialias: false,
        }}
      >
        <CameraController activeWorld={activeWorld} controlsRef={controlsRef} />
        <SceneLighting activeWorld={activeWorld} />
        <ToneMappingUpdater activeWorld={activeWorld} />

        <Suspense fallback={null}>
          {/* Все миры всегда в сцене — скрываем неактивные через visible чтобы не пересоздавать */}
          <group visible={activeWorld === 'default'}>
            <World scale={50} position={[0, 0, 0]} />
          </group>
          <group visible={activeWorld === 'desert'}>
            <Desert scale={1.9} position={[69.8, -54.3, -12.4]} rotation={[0, 0, 0]} />
          </group>
          <group visible={activeWorld === 'snow'}>
            <Snow scale={1.9} position={[96.03, -166.6, 0.9]} />
            <Torch scale={0.13} position={[1.8, 6.4, 3]} />
          </group>
          {activeWorld === 'snow' && (
            <>
              <TorchLight />
              <TorchGlow />
              {/* Лунный свет сверху со стороны камеры */}
              <pointLight position={[-15, 25, 0]} color="#ccd8ff" intensity={20} distance={50} decay={1.2} castShadow={false} />
              {/* Голубой направленный свет для всей дальней сцены */}
              <directionalLight position={[-30, 40, 0]} color="#3366dd" intensity={2.0} castShadow={false} />
            </>
          )}
          <Chest ref={chestRef} position={[0, 7.4, 0]} rotation={[0, activeWorld === 'desert' ? -Math.PI / 2 : activeWorld === 'snow' ? -Math.PI / 2 : 0, 0]} onToggle={setChestOpen} />
          {!chestOpen && started && (
            <Html position={[0, 9.5, 0]} center>
              <div style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '14px',
                color: '#fff',
                textShadow: '2px 2px 0 #000',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                userSelect: 'none',
              }}>
                Лабы здесь<br />↓
              </div>
            </Html>
          )}
        </Suspense>

        <OrbitControls ref={controlsRef} target={[0, 7.4, 0]} maxPolarAngle={Math.PI / 2} />
      </Canvas>

      <ChestInventory open={chestOpen} onClose={handleClose} onSelectWorld={handleSelectWorld} activeWorld={activeWorld} />
      {activeWorld === 'snow' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(74,106,138,0.18) 0%, transparent 40%)',
          pointerEvents: 'none',
          zIndex: 1,
        }} />
      )}
      <MusicPlayer autoPlay={started} />
      {!started && <StartScreen onStart={() => setStarted(true)} />}
    </div>
  )
}

export default App
