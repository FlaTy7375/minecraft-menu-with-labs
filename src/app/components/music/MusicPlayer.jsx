import { useState, useEffect, useRef } from 'react'
import './MusicPlayer.css'

const TRACKS = [
  { name: 'Subwoofer Lullaby', src: '/sounds/Subwoofer-Lullaby.mp3' },
  { name: 'Living Mice',       src: '/sounds/Living-Mice.mp3' },
  { name: 'Door',             src: '/sounds/Door.mp3' },
  { name: 'Key',             src: '/sounds/Key.mp3' },
]

export function MusicPlayer({ autoPlay = false }) {
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const audio = useRef(null)

  // Создаём audio один раз
  if (!audio.current) {
    audio.current = new Audio(TRACKS[0].src)
  }

  // Запуск когда пользователь нажал Start
//   useEffect(() => {
//     if (autoPlay) {
//       audio.current.play().then(() => setPlaying(true)).catch(() => {})
//     }
//   }, [autoPlay])

  // Смена трека
  useEffect(() => {
    const a = audio.current
    const wasPlaying = !a.paused
    a.src = TRACKS[current].src
    a.load()
    if (wasPlaying) a.play()

    const onMeta = () => setDuration(a.duration)
    const onEnd = () => setCurrent(i => (i + 1) % TRACKS.length)
    a.addEventListener('loadedmetadata', onMeta)
    a.addEventListener('ended', onEnd)
    return () => {
      a.removeEventListener('loadedmetadata', onMeta)
      a.removeEventListener('ended', onEnd)
    }
  }, [current])

  // Прогресс — обновляем раз в секунду через interval
  useEffect(() => {
    const id = setInterval(() => {
      const a = audio.current
      if (!a.paused) setProgress(a.currentTime)
    }, 500)
    return () => clearInterval(id)
  }, [])

  function togglePlay() {
    const a = audio.current
    if (a.paused) { a.play(); setPlaying(true) }
    else { a.pause(); setPlaying(false) }
  }

  function prev() { setCurrent(i => (i - 1 + TRACKS.length) % TRACKS.length) }
  function next() { setCurrent(i => (i + 1) % TRACKS.length) }

  function seek(e) {
    const val = parseFloat(e.target.value)
    audio.current.currentTime = val
    setProgress(val)
  }

  function fmt(s) {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="mc-player">
      <div className="mc-player-header" onClick={() => setExpanded(e => !e)}>
        <span className="mc-player-title">♪ {TRACKS[current].name}</span>
        <span className="mc-player-toggle">{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="mc-player-body">
          <div className="mc-player-controls">
            <button className="mc-btn" onClick={prev}>◀◀</button>
            <button className="mc-btn mc-btn-play" onClick={togglePlay}>
              {playing ? '▐▐' : '▶'}
            </button>
            <button className="mc-btn" onClick={next}>▶▶</button>
          </div>
          <div className="mc-player-seek">
            <span className="mc-time">{fmt(progress)}</span>
            <input
              type="range"
              className="mc-range"
              min={0}
              max={duration || 1}
              step={1}
              value={progress}
              onChange={seek}
            />
            <span className="mc-time">{fmt(duration)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
