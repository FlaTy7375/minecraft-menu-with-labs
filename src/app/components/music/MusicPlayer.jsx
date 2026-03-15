import { useState, useEffect, useRef } from 'react'
import './MusicPlayer.css'

const TRACKS = [
  { name: 'Subwoofer Lullaby', src: '/sounds/Subwoofer-Lullaby.mp3' },
  { name: 'Living Mice',       src: '/sounds/Living-Mice.mp3' },
  { name: 'Door',              src: '/sounds/Door.mp3' },
  { name: 'Key',               src: '/sounds/Key.mp3' },
]

export function MusicPlayer({ audioRef: externalRef }) {
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const internalRef = useRef(null)
  const audioRef = externalRef ?? internalRef
  const isFirst = useRef(true)
  const shouldPlay = useRef(false) // запоминаем нужно ли играть после смены трека

  if (!audioRef.current) {
    audioRef.current = new Audio(TRACKS[0].src)
  }

  // play/pause — один раз
  useEffect(() => {
    const a = audioRef.current
    const onPlay  = () => { setPlaying(true); shouldPlay.current = true }
    const onPause = () => { setPlaying(false); shouldPlay.current = false }
    a.addEventListener('play',  onPlay)
    a.addEventListener('pause', onPause)
    setPlaying(!a.paused)
    shouldPlay.current = !a.paused
    return () => {
      a.removeEventListener('play',  onPlay)
      a.removeEventListener('pause', onPause)
    }
  }, []) // eslint-disable-line

  // каждый трек: ended + loadedmetadata + смена src (кроме первого)
  useEffect(() => {
    const a = audioRef.current

    if (isFirst.current) {
      isFirst.current = false
      // первый трек уже играет — только слушаем meta и ended
      const onMeta = () => setDuration(a.duration)
      const onEnd  = () => {
        shouldPlay.current = true // трек закончился — следующий должен играть
        setCurrent(i => (i + 1) % TRACKS.length)
      }
      if (a.duration) setDuration(a.duration)
      a.addEventListener('loadedmetadata', onMeta)
      a.addEventListener('ended', onEnd)
      return () => {
        a.removeEventListener('loadedmetadata', onMeta)
        a.removeEventListener('ended', onEnd)
      }
    }

    // меняем трек
    a.src = TRACKS[current].src
    a.load()
    if (shouldPlay.current) a.play().catch(() => {})

    const onMeta = () => setDuration(a.duration)
    const onEnd  = () => {
      shouldPlay.current = true
      setCurrent(i => (i + 1) % TRACKS.length)
    }
    a.addEventListener('loadedmetadata', onMeta)
    a.addEventListener('ended', onEnd)
    return () => {
      a.removeEventListener('loadedmetadata', onMeta)
      a.removeEventListener('ended', onEnd)
    }
  }, [current]) // eslint-disable-line

  // прогресс
  useEffect(() => {
    const id = setInterval(() => {
      const a = audioRef.current
      if (a && !a.paused) setProgress(a.currentTime)
    }, 500)
    return () => clearInterval(id)
  }, []) // eslint-disable-line

  function togglePlay() {
    const a = audioRef.current
    if (a.paused) a.play().catch(() => {})
    else a.pause()
  }

  function prev() { setCurrent(i => (i - 1 + TRACKS.length) % TRACKS.length) }
  function next() { setCurrent(i => (i + 1) % TRACKS.length) }

  function seek(e) {
    const val = parseFloat(e.target.value)
    audioRef.current.currentTime = val
    setProgress(val)
  }

  function fmt(s) {
    if (!s || isNaN(s)) return '0:00'
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
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
              type="range" className="mc-range"
              min={0} max={duration || 1} step={1} value={progress}
              onChange={seek}
            />
            <span className="mc-time">{fmt(duration)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
