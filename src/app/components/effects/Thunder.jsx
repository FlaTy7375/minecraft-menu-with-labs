import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'

// Seamless loop через Web Audio API
let rainCtx = null
let rainSource = null
let rainGain = null
let rainBuffer = null
let stopTimer = null

async function startRain() {
  // Отменяем pending stop если он есть
  if (stopTimer) { clearTimeout(stopTimer); stopTimer = null }

  if (!rainCtx) rainCtx = new (window.AudioContext || window.webkitAudioContext)()
  if (rainCtx.state === 'suspended') await rainCtx.resume()
  if (rainSource) {
    // Уже играет — просто fade in если был fade out
    if (rainGain) {
      rainGain.gain.cancelScheduledValues(rainCtx.currentTime)
      rainGain.gain.setValueAtTime(rainGain.gain.value, rainCtx.currentTime)
      rainGain.gain.linearRampToValueAtTime(0.35, rainCtx.currentTime + 1.5)
    }
    return
  }

  if (!rainBuffer) {
    const res = await fetch('/sounds/rain.mp3')
    const arr = await res.arrayBuffer()
    rainBuffer = await rainCtx.decodeAudioData(arr)
  }

  rainGain = rainCtx.createGain()
  rainGain.gain.setValueAtTime(0, rainCtx.currentTime)
  rainGain.gain.linearRampToValueAtTime(0.35, rainCtx.currentTime + 2.0)
  rainGain.connect(rainCtx.destination)

  rainSource = rainCtx.createBufferSource()
  rainSource.buffer = rainBuffer
  rainSource.loop = true
  rainSource.loopStart = 0.3
  rainSource.loopEnd   = 1.75
  rainSource.connect(rainGain)
  rainSource.start(0, 0.3)
}

function stopRain() {
  if (rainGain && rainCtx) {
    rainGain.gain.cancelScheduledValues(rainCtx.currentTime)
    rainGain.gain.setValueAtTime(rainGain.gain.value, rainCtx.currentTime)
    rainGain.gain.linearRampToValueAtTime(0, rainCtx.currentTime + 1.5)
  }
  stopTimer = setTimeout(() => {
    stopTimer = null
    if (rainSource) {
      try { rainSource.stop() } catch {}
      rainSource = null
    }
    if (rainGain) {
      try { rainGain.disconnect() } catch {}
      rainGain = null
    }
  }, 1600)
}

export function Thunder({ active }) {
  const lightRef = useRef()
  const state = useRef({
    nextFlash: 3 + Math.random() * 5,
    phase: 'idle',
    timer: 0,
  })

  const thunderSound = useMemo(() => {
    const a = new Audio('/sounds/thunder.mp3')
    a.volume = 0.6
    return a
  }, [])

  useEffect(() => {
    if (active) startRain()
    else stopRain()
    return () => stopRain()
  }, [active])

  useFrame((_, delta) => {
    if (!lightRef.current || !active) {
      if (lightRef.current) lightRef.current.intensity = 0
      return
    }

    const s = state.current
    s.timer += delta

    if (s.phase === 'idle') {
      lightRef.current.intensity = 0
      if (s.timer >= s.nextFlash) {
        s.phase = 'flash1'
        s.timer = 0
      }
    } else if (s.phase === 'flash1') {
      // Быстрая яркая вспышка
      lightRef.current.intensity = 12
      if (s.timer >= 0.08) {
        s.phase = 'gap'
        s.timer = 0
        // Звук грома с небольшой задержкой
        setTimeout(() => {
          thunderSound.currentTime = 0
          thunderSound.play().catch(() => {})
        }, 200 + Math.random() * 400)
      }
    } else if (s.phase === 'gap') {
      lightRef.current.intensity = 0
      if (s.timer >= 0.06) {
        s.phase = 'flash2'
        s.timer = 0
      }
    } else if (s.phase === 'flash2') {
      // Вторая вспышка слабее
      lightRef.current.intensity = 6
      if (s.timer >= 0.12) {
        s.phase = 'idle'
        s.timer = 0
        s.nextFlash = 4 + Math.random() * 8
      }
    }
  })

  return (
    <ambientLight ref={lightRef} color="#c8d8ff" intensity={0} />
  )
}
