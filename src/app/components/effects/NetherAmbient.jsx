import { useEffect } from 'react'

let ctx = null
let source = null
let gain = null
let buffer = null
let stopTimer = null

async function startLava() {
  if (stopTimer) { clearTimeout(stopTimer); stopTimer = null }
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') await ctx.resume()
  if (source) {
    if (gain) {
      gain.gain.cancelScheduledValues(ctx.currentTime)
      gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 2.0)
    }
    return
  }
  if (!buffer) {
    const res = await fetch('/sounds/lava.mp3')
    const arr = await res.arrayBuffer()
    buffer = await ctx.decodeAudioData(arr)
  }
  gain = ctx.createGain()
  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 2.0)
  gain.connect(ctx.destination)

  source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true
  source.connect(gain)
  source.start()
}

function stopLava() {
  if (gain && ctx) {
    gain.gain.cancelScheduledValues(ctx.currentTime)
    gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5)
  }
  stopTimer = setTimeout(() => {
    stopTimer = null
    if (source) { try { source.stop() } catch {} source = null }
    if (gain) { try { gain.disconnect() } catch {} gain = null }
  }, 1600)
}

export function NetherAmbient({ active }) {
  useEffect(() => {
    if (active) startLava()
    else stopLava()
    return () => stopLava()
  }, [active])

  return null
}
