import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { Suspense, useEffect, useState, useRef, useMemo } from 'react'
import * as THREE from 'three'
import { Model as Bed } from './app/models/Minecraft_bed'
import { Model as Blocks } from './app/models/Minecraft_blocks'
import { Model as World } from './app/models/Minecraft_world'
import { Model as Desert } from './app/models/Minecraft_dessert'
import { Model as Snow } from './app/models/Minecraft_snow'
import { Model as Torch } from './app/models/Minecraft_torch'
import { Model as Jungle } from './app/models/Minecraft_jungle'
import { Model as Ocean } from './app/models/Minecraft_ocean'
import { Model as Mushroom } from './app/models/Minecraft_mushroom'
import { Model as Nether } from './app/models/Minecraft_nether'
import { Model as End } from './app/models/Minecraft_end'
import { Model as Chest } from './app/models/Minecraft-chest'
import { BedSky } from './app/textures/BedSky'
import { CloudSky } from './app/textures/CloudSky'
import { DesertSky } from './app/textures/DesertSky'
import { SnowSky } from './app/textures/SnowSky'
import { JungleSky } from './app/textures/JungleSky'
import { OceanSky } from './app/textures/OceanSky'
import { MushroomSky } from './app/textures/MushroomSky'
import { NetherSky } from './app/textures/NetherSky'
import { EndSky } from './app/textures/EndSky'
import { Snowfall } from './app/components/effects/Snowfall'
import { Rainfall } from './app/components/effects/Rainfall'
import { Bubbles } from './app/components/effects/Bubbles'
import { Fireflies } from './app/components/effects/Fireflies'
import { LavaParticles } from './app/components/effects/LavaParticles'
import { EndParticles } from './app/components/effects/EndParticles'
import { OceanAmbient } from './app/components/effects/OceanAmbient'
import { WindAmbient } from './app/components/effects/WindAmbient'
import { NetherAmbient } from './app/components/effects/NetherAmbient'
import { Thunder } from './app/components/effects/Thunder'
import { ChestInventory } from './app/components/ChestInventory/ChestInventory'
import { MusicPlayer } from './app/components/music/MusicPlayer'
import { StartScreen } from './app/components/StartScreen/StartScreen'

const SUNSET_SUN = new THREE.Vector3(-100, 25, 50)
const DESERT_SUN = new THREE.Vector3(-100, 20, 40)
const MOON_POS   = new THREE.Vector3(-80, 80, -80)

// Позиция камеры: в пустыне сундук повёрнут -90° по Y, значит "спереди" — со стороны +X
const CAM_DEFAULT = new THREE.Vector3(-4.90, 14.68, 18.40)
const CAM_BED     = new THREE.Vector3(15.61, 10.82, 3.78)
const CAM_DESERT  = new THREE.Vector3(-15.77, 13.68, -4.31)
const CAM_SNOW    = new THREE.Vector3(-20.30, 12.03, -5.07)
const CAM_JUNGLE  = new THREE.Vector3(-4.78, 13.71, 19.83)
const CAM_OCEAN    = new THREE.Vector3(20.52, 9.51, 5.20)
const CAM_MUSHROOM = new THREE.Vector3(19.34, 10.91, 5.14)
const CAM_NETHER   = new THREE.Vector3(-18.68, 10.17, -4.54)
const CAM_END      = new THREE.Vector3(-20.27, 11.24, -5.30)

function CameraController({ activeWorld, controlsRef }) {
  const { camera } = useThree()
  const animating = useRef(false)
  const targetPos = useRef(new THREE.Vector3(...CAM_DEFAULT))
  const prevWorld = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'l' || e.key === 'L') {
        const p = camera.position
        const t = controlsRef.current?.target
        console.log(`cam: [${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}] target: [${t?.x.toFixed(2)}, ${t?.y.toFixed(2)}, ${t?.z.toFixed(2)}]`)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [camera, controlsRef])

  const camForWorld = (w) => {
    if (w === 'bed')    return CAM_BED
    if (w === 'desert') return CAM_DESERT
    if (w === 'snow')   return CAM_SNOW
    if (w === 'jungle') return CAM_JUNGLE
    if (w === 'ocean')    return CAM_OCEAN
    if (w === 'mushroom') return CAM_MUSHROOM
    if (w === 'nether')   return CAM_NETHER
    if (w === 'end')      return CAM_END
    return CAM_DEFAULT
  }

  const targetForWorld = (w) => w === 'bed' ? [-7.92, 10.71, 3.49] : w === 'default' ? [-4.90, 7.79, -0.15] : w === 'desert' ? [0.15, 7.81, -4.15] : w === 'snow' ? [0.16, 8.07, -4.99] : w === 'jungle' ? [-4.75, 7.74, -0.13] : w === 'ocean' ? [0.91, 6.88, 5.09] : w === 'mushroom' ? [-0.18, 7.62, 5.09] : w === 'nether' ? [-0.04, 7.72, -4.41] : w === 'end' ? [2.81, 11.24, -5.03] : [0, 7.4, 0]

  useFrame(() => {
    if (prevWorld.current !== activeWorld) {
      prevWorld.current = activeWorld
      targetPos.current.copy(camForWorld(activeWorld))
      animating.current = true
      if (controlsRef.current) controlsRef.current.enabled = false
    }

    if (!animating.current) return

    const [tx, ty, tz] = targetForWorld(activeWorld)
    camera.position.lerp(targetPos.current, 0.15)
    if (controlsRef.current) {
      controlsRef.current.target.set(tx, ty, tz)
      controlsRef.current.update()
    }
    if (camera.position.distanceTo(targetPos.current) < 0.01) {
      camera.position.copy(targetPos.current)
      animating.current = false
      if (controlsRef.current) {
        controlsRef.current.target.set(tx, ty, tz)
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
    spriteRef.current.scale.setScalar(1.6 * f)
  })

  return (
    <sprite ref={spriteRef} position={[0.4, 7.55, -8.7]}>
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
    if (lightRef.current) lightRef.current.intensity = 20.0 * flicker
  })
  const torchPos = [0.4, 7.15, -8.7]
  return (
    <>
      <pointLight ref={lightRef} position={torchPos} color="#ff7700" intensity={20} distance={35} decay={1.2} castShadow={false} />
      <pointLight position={torchPos} color="#ffcc44" intensity={10} distance={6} decay={2} castShadow={false} />
    </>
  )
}

function EndCrystalLight() {
  const lightRef = useRef()
  useFrame(({ clock }) => {
    if (!lightRef.current) return
    const t = clock.getElapsedTime()
    const pulse = 1.0 + Math.sin(t * 1.8) * 0.4 + Math.sin(t * 3.3) * 0.15
    lightRef.current.intensity = 12 * pulse
  })
  return (
    <pointLight ref={lightRef} position={[5, 18, -5]} color="#cc44ff" intensity={12} distance={55} decay={1.4} castShadow={false} />
  )
}

function WallLabel({ position, rotation, onClick, imageSrc = '/images/lab1.png', removeWhite = true }) {
  const texture = useMemo(() => {
    const tex = new THREE.TextureLoader().load(imageSrc, (t) => {
      if (!removeWhite) {
        tex.colorSpace = THREE.SRGBColorSpace
        tex.needsUpdate = true
        return
      }
      // убираем белый фон через canvas
      const img = t.image
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const d = data.data
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i+1], b = d[i+2]
        // если пиксель близок к белому — делаем прозрачным
        if (r > 230 && g > 230 && b > 230) d[i+3] = 0
      }
      ctx.putImageData(data, 0, 0)
      const newTex = new THREE.CanvasTexture(canvas)
      newTex.colorSpace = THREE.SRGBColorSpace
      tex.image = newTex.image
      tex.needsUpdate = true
    })
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [imageSrc, removeWhite])

  return (
    <group position={position} rotation={rotation}>
      {/* видимый меш со скриншотом */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[4.2, 3]} />
        <meshStandardMaterial map={texture} transparent alphaTest={0.1} roughness={0.8} metalness={0} emissive={new THREE.Color(0xffffff)} emissiveMap={texture} emissiveIntensity={removeWhite ? 0.01 : 0.06} />
      </mesh>
      {/* невидимый хитбокс чуть впереди блоков */}
      <mesh
        position={[0, 0, 0.05]}
        onClick={(e) => { e.stopPropagation(); onClick() }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'auto' }}
      >
        <planeGeometry args={[4.2, 3]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function ToneMappingUpdater({ activeWorld }) {
  const { gl } = useThree()
  const getExposure = (w) => {
    if (w === 'bed')      return 1.1
    if (w === 'desert')   return 1.0
    if (w === 'snow')     return 1.3
    if (w === 'jungle')   return 0.5
    if (w === 'ocean')    return 1.1
    if (w === 'mushroom') return 0.85
    if (w === 'nether')   return 0.7
    if (w === 'end')      return 0.75
    return 2.2
  }
  useFrame(() => {
    gl.toneMappingExposure = getExposure(activeWorld)
  })
  return null
}

function SceneLighting({ activeWorld }) {
  const isDesert   = activeWorld === 'desert'
  const isSnow     = activeWorld === 'snow'
  const isJungle   = activeWorld === 'jungle'
  const isOcean    = activeWorld === 'ocean'
  const isMushroom = activeWorld === 'mushroom'
  const isNether   = activeWorld === 'nether'
  const isEnd      = activeWorld === 'end'
  const isBed      = activeWorld === 'bed'
  const sunPos     = isDesert ? DESERT_SUN : isSnow ? MOON_POS : isOcean ? new THREE.Vector3(80, 30, 0) : isMushroom ? new THREE.Vector3(60, 8, 40) : isEnd ? new THREE.Vector3(0, 50, 0) : isBed ? new THREE.Vector3(60, 15, -80) : SUNSET_SUN

  return (
    <>
      {isDesert ? <DesertSky /> : isSnow ? <SnowSky /> : isJungle ? <JungleSky /> : isOcean ? <OceanSky /> : isMushroom ? <MushroomSky /> : isNether ? <NetherSky /> : isEnd ? <EndSky /> : isBed ? <BedSky /> : <CloudSky />}

      <directionalLight
        position={sunPos}
        intensity={isDesert ? 5 : isSnow ? 0 : isJungle ? 0.4 : isOcean ? 4 : isMushroom ? 1.8 : isNether ? 2 : isEnd ? 1.5 : isBed ? 3.5 : 8}
        color={isDesert ? '#ffffff' : isSnow ? '#c8d8ff' : isJungle ? '#aaaaaa' : isOcean ? '#88bbff' : isMushroom ? '#ffaacc' : isNether ? '#ff4400' : isEnd ? '#cc99ff' : isBed ? '#ffbb88' : '#ff7000'}
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
          : isJungle
            ? <hemisphereLight args={['#606060', '#303030', 0.6]} />
            : isOcean
              ? <hemisphereLight args={['#004466', '#001122', 1.5]} />
              : isMushroom
                ? <hemisphereLight args={['#ddaacc', '#3a1a2a', 1.2]} />
                : isNether
                  ? <hemisphereLight args={['#cc2200', '#1a0000', 1.5]} />
                  : isEnd
                    ? <hemisphereLight args={['#3a1a66', '#0a0018', 1.6]} />
                    : isBed
                      ? <hemisphereLight args={['#ffccaa', '#a0b8d0', 1.4]} />
                      : <hemisphereLight args={['#ff9040', '#3a1000', 1.8]} />
      }

      {!isDesert && !isSnow && !isJungle && !isOcean && !isMushroom && !isNether && !isEnd && !isBed && <SunFlare />}
      {isSnow && (
        <>
          <Snowfall />
          <fog attach="fog" args={['#0a0f1e', 60, 140]} />
        </>
      )}
      {isJungle && (
        <>
          <Rainfall />
          <fog attach="fog" args={['#282828', 18, 65]} />
          {/* Солнечный пробив сквозь облака — тёплый закатный */}
          <directionalLight position={[15, 20, -10]} color="#ff9944" intensity={1.2} castShadow={false} />
          {/* Слабый свет со стороны открытия сундука */}
          <pointLight position={[0, 0, 3]} color="#aabbaa" intensity={0.07} distance={10} decay={-40} castShadow={false} />
        </>
      )}
      {isMushroom && (
        <>
          <fog attach="fog" args={['#3a1a30', 18, 75]} />
          <directionalLight position={[-60, 15, -40]} color="#cc88bb" intensity={0.7} castShadow={false} />
          <pointLight position={[0, 2, 0]} color="#ffbbdd" intensity={2.5} distance={25} decay={2} castShadow={false} />
          <Fireflies />
        </>
      )}
      {isNether && (
        <>
          <fog attach="fog" args={['#3a0800', 80, 250]} />
          <pointLight position={[0, 0, 0]} color="#ff6600" intensity={25} distance={50} decay={1.2} castShadow={false} />
          <pointLight position={[10, 5, -10]} color="#ff4400" intensity={10} distance={35} decay={1.5} castShadow={false} />
          <LavaParticles />
        </>
      )}
      {isBed && (
        <>
          <fog attach="fog" args={['#e8956a', 30, 100]} />
          {/* Основной рассветный луч — тёплое золото со стороны солнца */}
          <directionalLight position={[60, 15, -80]} color="#ffaa44" intensity={2.5} castShadow={false} />
          {/* Мягкий розовый fill с противоположной стороны */}
          <pointLight position={[-20, 18, 10]} color="#ffaacc" intensity={15} distance={80} decay={1.2} castShadow={false} />
          {/* Тёплый оранжевый снизу — отражение от земли */}
          <pointLight position={[0, 3, 0]} color="#ff8833" intensity={8} distance={40} decay={1.8} castShadow={false} />
        </>
      )}
      {isEnd && (
        <>
          <fog attach="fog" args={['#0a0015', 50, 180]} />
          {/* Кристалл эндера — пульсирующий фиолетовый свет */}
          <EndCrystalLight />
          {/* Портал дракона — слабое зелёное свечение снизу */}
          <pointLight position={[0, 2, 0]} color="#00ff88" intensity={3} distance={20} decay={2} castShadow={false} />
          {/* Общий холодный фиолетовый fill */}
          <pointLight position={[-10, 15, 10]} color="#9933ff" intensity={6} distance={60} decay={1.5} castShadow={false} />
          {/* Свет на сундук спереди */}
          <pointLight position={[-7, 10, 0]} color="#bb88ff" intensity={18} distance={25} decay={1.5} castShadow={false} />
          {/* Ambient для видимости дальних объектов */}
          <ambientLight intensity={0.38} color="#4422aa" />
          <EndParticles />
        </>
      )}
      {isOcean && (
        <>
          {/* Подводный туман — плотный синий */}
          <fog attach="fog" args={['#062a4a', 15, 80]} />
          {/* Солнечный свет сквозь воду сверху */}
          <pointLight position={[0, 30, 0]} color="#00eeff" intensity={25} distance={80} decay={1.0} castShadow={false} />
          {/* Отражение от дна */}
          <pointLight position={[0, -5, 0]} color="#003366" intensity={8} distance={30} decay={1.5} castShadow={false} />
          <Bubbles />
        </>
      )}
      {/* Thunder всегда в сцене — управляет звуком дождя через active prop */}
      <Thunder active={isJungle} />
      <OceanAmbient active={isOcean} />
      <WindAmbient active={activeWorld === 'snow'} />
      <NetherAmbient active={isNether} />
    </>
  )
}

function App() {
  const [chestOpen, setChestOpen] = useState(false)
  const [started, setStarted] = useState(false)
  const [activeWorld, setActiveWorld] = useState('bed')
  const [wallModal, setWallModal] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 600)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const chestRef = useRef()
  const controlsRef = useRef()
  const transitionTimer = useRef()
  const audioRef = useRef(null)

  function handleSelectWorld(world) {
    setActiveWorld(world)
    setWallModal(false)
    setTransitioning(true)
    clearTimeout(transitionTimer.current)
    transitionTimer.current = setTimeout(() => setTransitioning(false), 1800)
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
        shadows={{ type: THREE.PCFShadowMap }}
        camera={{ position: [0, 10, 7], fov: 70 }}
        dpr={Math.min(window.devicePixelRatio, 1.5)}
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
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
          <group visible={activeWorld === 'bed'}>
            <Bed scale={46} position={[-37.37, -6.89, -6.65]} />
          </group>
          <group visible={activeWorld === 'default'}>
            <World scale={50} position={[-16, 0, 0]} />
            {[-1.75 + 3.4 - 4.75, -1.75 + 3.4 - 1.7 - 4.75, -1.75 + 3.4 - 3.4 - 4.75].map((x, col) =>
              [6.5, 6.5 + 1.7, 6.5 + 3.4].map((y, row) => (
                <Blocks key={`q-${col}-${row}`} scale={1.7} position={[x, y, -3.3]} onClick={activeWorld === 'default' ? () => setWallModal(true) : undefined} />
              ))
            )}
          </group>
          <group visible={activeWorld === 'desert'}>
            <Desert scale={1.9} position={[70.8, -54.3, -22.6]} rotation={[0, 0, 0]} />
            {[-1.75 + 3.4 - 8.2, -1.75 + 3.4 - 1.7 - 8.2, -1.75 + 3.4 - 3.4 - 8.2].map((z, col) =>
              [6.6, 6.6 + 1.7, 6.6 + 3.4].map((y, row) => (
                <Blocks key={`q-${col}-${row}`} scale={1.7} position={[0, y, z]} onClick={activeWorld === 'desert' ? () => setWallModal(true) : undefined} />
              ))
            )}
          </group>
          <group visible={activeWorld === 'snow'}>
            <Snow scale={1.9} position={[96.03, -166.6, -7.6]} />
            <Torch scale={0.13} position={[0.4, 6.4, -8.7]} />
            {[-1.75 + 3.4 - 8.4, -1.75 + 3.4 - 10.1, -1.75 + 3.4 - 11.8].map((z, col) =>
              [6.6, 6.6 + 1.7, 6.6 + 3.4].map((y, row) => (
                <Blocks key={`q-${col}-${row}`} scale={1.7} position={[-0.2, y, z]} onClick={activeWorld === 'snow' ? () => setWallModal(true) : undefined} />
              ))
            )}
          </group>
          <group visible={activeWorld === 'jungle'}>
            <Jungle scale={116} position={[91.1, -80.45, -70.2]} />
            {[-6.55 + 3.4, -6.55 + 3.4 - 1.7, -6.55 + 3.4 - 3.4].map((x, col) =>
              [6.6, 6.6 + 1.7, 6.6 + 3.4].map((y, row) => (
                <Blocks key={`q-${col}-${row}`} scale={1.7} position={[x, y, -3.2]} onClick={activeWorld === 'jungle' ? () => setWallModal(true) : undefined} />
              ))
            )}
          </group>
          <group visible={activeWorld === 'ocean'}>
            <Ocean scale={1.8} position={[-44.1, -43.9, 8.1]} />
            {[0.1 + 3.4, 0.1 + 3.4 - 1.7, 0.1 + 3.4 - 3.4].map((z, col) =>
              [6.5, 6.5 + 1.7, 6.5 + 3.4].map((y, row) => (
                <Blocks key={`q-${col}-${row}`} scale={1.7} position={[0, y, z]} onClick={activeWorld === 'ocean' ? () => setWallModal(true) : undefined} />
              ))
            )}
          </group>
          <group visible={activeWorld === 'mushroom'}>
            <Mushroom scale={40} position={[-49.2, -41.75, 15.76]} />
            {[0.1 + 3.4, 0.1 + 3.4 - 1.7, 0.1 + 3.4 - 3.4].map((z, col) =>
              [6.6, 6.6 + 1.7, 6.6 + 3.4].map((y, row) => (
                <Blocks key={`q-${col}-${row}`} scale={1.7} position={[0, y, z]} onClick={activeWorld === 'mushroom' ? () => setWallModal(true) : undefined} />
              ))
            )}
          </group>
          <group visible={activeWorld === 'nether'}>
            <Nether scale={155} position={[54.17, 3.29, 44.32]} />
            {[-9.9 + 3.4, -9.9 + 3.4 - 1.7, -9.9 + 3.4 - 3.4].map((z, col) =>
              [6.5, 6.5 + 1.7, 6.5 + 3.4].map((y, row) => (
                <Blocks key={`q-${col}-${row}`} scale={1.7} position={[0, y, z]} onClick={activeWorld === 'nether' ? () => setWallModal(true) : undefined} />
              ))
            )}
          </group>
          <group visible={activeWorld === 'end'}>
            <End scale={160} position={[98.15, -43, 60]} />
            {[-10.4 + 3.4, -10.4 + 3.4 - 1.7, -10.4 + 3.4 - 3.4].map((z, col) =>
              [6.5, 6.5 + 1.7, 6.5 + 3.4].map((y, row) => (
                <Blocks key={`q-${col}-${row}`} scale={1.7} position={[0, y, z]} onClick={activeWorld === 'end' ? () => setWallModal(true) : undefined} />
              ))
            )}
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
          <Chest ref={chestRef} position={[0, 7.4, 0]} rotation={[0, activeWorld === 'bed' ? 0 : activeWorld === 'desert' ? -Math.PI / 2 : activeWorld === 'snow' ? -Math.PI / 2 : activeWorld === 'jungle' ? 0 : activeWorld === 'ocean' ? Math.PI / 2 : activeWorld === 'mushroom' ? Math.PI / 2 : activeWorld === 'nether' ? -Math.PI / 2 : activeWorld === 'end' ? -Math.PI / 2 : 0, 0]} onToggle={setChestOpen} />

          {/* Превью лабы на стене — текстура на плоскости */}
          {activeWorld !== 'bed' && (() => {
            const wallConfigs = {
              default:  { pos: [-4.8,  9.2, 0.97], rot: [0, 0, 0] },
              desert:   { pos: [-0.86,   9.2, -4.85], rot: [0,  -Math.PI / 2, 0] },
              snow:     { pos: [-1.06,  9.2, -5], rot: [0,  -Math.PI / 2, 0] },
              jungle:   { pos: [-4.85, 9.2, 1.1], rot: [0, 0, 0] },
              ocean:    { pos: [0.9,  9.2,  5.15], rot: [0, Math.PI / 2, 0] },
              mushroom: { pos: [0.9,  9.2,  5.15], rot: [0, Math.PI / 2, 0] },
              nether:   { pos: [-0.9,  9.2, -4.75], rot: [0,  -Math.PI / 2, 0] },
              end:      { pos: [-0.9,  9.2, -5.25], rot: [0,  -Math.PI / 2, 0] },
            }
            const cfg = wallConfigs[activeWorld]
            if (!cfg) return null
            const labImage = activeWorld === 'desert' ? '/images/lab2.png' : activeWorld === 'snow' ? '/images/lab3.png' : activeWorld === 'jungle' ? '/images/lab4.png' : '/images/lab1.png'
            return (
              <WallLabel position={cfg.pos} rotation={cfg.rot} onClick={() => setWallModal(true)} imageSrc={labImage} removeWhite={activeWorld !== 'jungle'} />
            )
          })()}
          {/* label */}
          {!chestOpen && started && !wallModal && (
            <Html position={[0, 9.5, 0]} center transform sprite style={{ pointerEvents: 'none' }}>
              <div style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '16px',
                color: '#fff',
                textShadow: '2px 2px 0 #000',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                userSelect: 'none',
              }}>
                <span className="mc-label-pulse">Лабы здесь</span><br /><span className="arrow-bounce">↓</span>
              </div>
            </Html>
          )}
          {activeWorld === 'bed' && !chestOpen && started && (
            <Html position={[5, 14, 3.7]} center distanceFactor={14} style={{ pointerEvents: 'none' }}>
              <div className="mc-welcome-intro" style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 'clamp(13px, 1.2vw, 11px)',
                color: '#fff',
                textShadow: '2px 2px 0 #000',
                textAlign: 'center',
                lineHeight: '1.8',
                width: '90vw',
                maxWidth: '520px',
                whiteSpace: 'normal',
                pointerEvents: 'none',
                userSelect: 'none',
              }}>
                Привет, это мой проект для просмотра лабораторных работ по вебу, загляни в сундук снизу, там все есть.
              </div>
            </Html>
          )}
        </Suspense>

        <OrbitControls ref={controlsRef} target={[0, 7.4, 0]} maxPolarAngle={Math.PI / 2} />
      </Canvas>

      <ChestInventory open={chestOpen} onClose={handleClose} onSelectWorld={handleSelectWorld} activeWorld={activeWorld} />

      {wallModal && activeWorld !== 'bed' && (
        <div onClick={() => setWallModal(false)} style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: isMobile ? '95vw' : '80vw',
            height: isMobile ? '53vh' : '80vh',
            position: 'relative',
            imageRendering: 'pixelated',
            background: `
              repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(180,170,160,0.15) 15px, rgba(180,170,160,0.15) 16px),
              repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(180,170,160,0.15) 15px, rgba(180,170,160,0.15) 16px),
              linear-gradient(135deg, #f0ece4 0%, #e8e2d8 30%, #f2ede6 50%, #ddd8ce 70%, #ede8e0 100%)
            `,
            border: '4px solid',
            borderColor: '#fff #aaa #aaa #fff',
            boxShadow: '4px 4px 0 #555, inset 1px 1px 0 rgba(255,255,255,0.8)',
            padding: '20px',
            overflowY: 'auto',
          }}>
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
              {/* Сетка 3×3 — имитация кварцевых блоков */}
              <div style={{
                position: 'absolute', inset: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridTemplateRows: 'repeat(3, 1fr)',
                gap: '4px',
                padding: '4px',
              }}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} style={{
                    background: `linear-gradient(135deg, #f4f0e8 0%, #e8e2d6 40%, #f0ebe2 60%, #ddd6ca 100%)`,
                    border: '2px solid',
                    borderColor: 'rgba(255,255,255,0.7) rgba(160,150,140,0.5) rgba(160,150,140,0.5) rgba(255,255,255,0.7)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {/* прожилки внутри каждого блока */}
                    <div style={{ position: 'absolute', top: '30%', left: '10%', width: '40%', height: '1px', background: 'rgba(120,110,100,0.3)', transform: 'rotate(-10deg)' }} />
                    <div style={{ position: 'absolute', top: '60%', left: '30%', width: '30%', height: '1px', background: 'rgba(120,110,100,0.25)', transform: 'rotate(5deg)' }} />
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setWallModal(false)} style={{
              position: 'absolute', top: '10px', right: '10px',
              background: '#d8d0c4', border: '2px solid', borderColor: '#fff #888 #888 #fff',
              width: '24px', height: '24px', cursor: 'pointer',
              fontFamily: "'Press Start 2P', monospace", fontSize: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#333', boxShadow: '2px 2px 0 #555',
              zIndex: 10,
            }}>✕</button>
            <iframe
              src={activeWorld === 'desert' ? '/labs/lab2/html/index.html' : activeWorld === 'snow' ? '/labs/lab3/html/index.html' : activeWorld === 'jungle' ? '/labs/lab4/html/index.html' : '/labs/lab1/index.html'}
              style={{
                position: 'relative',
                zIndex: 5,
                width: '100%',
                height: '100%',
                border: 'none',
                background: 'transparent',
              }}
              title={activeWorld === 'desert' ? 'Лабораторная работа №2' : activeWorld === 'snow' ? 'Лабораторная работа №3' : activeWorld === 'jungle' ? 'Лабораторная работа №4' : 'Лабораторная работа №1'}
            />
          </div>
        </div>
      )}
      {activeWorld === 'bed' && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(255,160,80,0.15) 0%, transparent 50%)',
          pointerEvents: 'none', zIndex: 1,
        }} />
      )}
      {activeWorld === 'snow' && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(74,106,138,0.18) 0%, transparent 40%)',
          pointerEvents: 'none', zIndex: 1,
        }} />
      )}
      {activeWorld === 'jungle' && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(180,185,188,0.25) 0%, transparent 50%)',
          pointerEvents: 'none', zIndex: 1,
        }} />
      )}
      {activeWorld === 'mushroom' && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 25%, rgba(60,10,50,0.6) 100%)',
          pointerEvents: 'none', zIndex: 1,
        }} />
      )}
      {activeWorld === 'nether' && (
        <>
          {/* Свечение лавы снизу */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(200,60,0,0.45) 0%, rgba(150,30,0,0.2) 20%, transparent 50%)',
            pointerEvents: 'none', zIndex: 1,
            animation: 'lavaPulse 2.5s ease-in-out infinite alternate',
          }} />
          {/* Тёмный виньет по краям */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(20,0,0,0.55) 100%)',
            pointerEvents: 'none', zIndex: 1,
          }} />
        </>
      )}
      {activeWorld === 'ocean' && (
        <>
          {/* Синее виньетирование по краям */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,20,60,0.7) 100%)',
            pointerEvents: 'none', zIndex: 1,
          }} />
          {/* Каустики — анимированные световые блики */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23f)' opacity='0.15'/%3E%3C/svg%3E")`,
            opacity: 0.3,
            mixBlendMode: 'screen',
            animation: 'caustics 4s ease-in-out infinite alternate',
            pointerEvents: 'none', zIndex: 2,
          }} />
          {/* Общий синий тинт */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0, 30, 80, 0.25)',
            pointerEvents: 'none', zIndex: 1,
          }} />
        </>
      )}
      {activeWorld === 'end' && (
        <>
          {/* Пульсирующий фиолетовый виньет */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(30,0,60,0.65) 100%)',
            pointerEvents: 'none', zIndex: 1,
            animation: 'endPulse 3s ease-in-out infinite alternate',
          }} />
          {/* Свечение сверху — как от кристаллов */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 0%, rgba(140,0,255,0.18) 0%, transparent 60%)',
            pointerEvents: 'none', zIndex: 1,
            animation: 'endPulse 2.2s ease-in-out infinite alternate-reverse',
          }} />
          {/* Зелёный отблеск снизу — портал */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,180,80,0.12) 0%, transparent 35%)',
            pointerEvents: 'none', zIndex: 1,
          }} />
        </>
      )}
      {started && <MusicPlayer audioRef={audioRef} />}
      {!started && <StartScreen onStart={() => {
        if (!audioRef.current) audioRef.current = new Audio('/sounds/Subwoofer-Lullaby.mp3')
        audioRef.current.play().catch(() => {})
        setStarted(true)
      }} />}
    </div>
  )
}

export default App
