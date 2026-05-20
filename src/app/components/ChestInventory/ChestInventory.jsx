import { useState, memo, useCallback } from 'react'
import './ChestInventory.css'

// WORLDS вынесен за компонент — не пересоздаётся при рендере
const WORLDS = [
  { id: 'bed',       img: '/images/bed.webp',      label: 'Уютное утро',         desc: 'Розовый рассвет' },
  { id: 'default',   img: '/images/dirt.webp',     label: 'Обычный мир',         desc: 'Зелёные луга и закат' },
  { id: 'desert',    img: '/images/desert.png',    label: 'Пустыня',             desc: 'Жаркий полдень и песок' },
  { id: 'snow',      img: '/images/snow.png',      label: 'Снежный мир',         desc: 'Холодные просторы' },
  { id: 'jungle',    img: '/images/лианы.webp',    label: 'Джунгли',             desc: 'Тропический лес' },
  { id: 'ocean',     img: '/images/fish.webp',     label: 'Океан',               desc: 'Подводный монумент' },
  { id: 'mushroom',  img: '/images/mushroom.png',  label: 'Грибной остров',      desc: 'Мистический остров' },
  { id: 'nether',    img: '/images/obsidian.webp', label: 'Незер',               desc: 'Огненное измерение' },
  { id: 'end',       img: '/images/end.webp',      label: 'Край',                desc: 'Измерение Дракона' },
  { id: 'deep_dark', img: '/images/sculk.png',     label: 'Древний город',       desc: 'Мрачные глубины' },
  { id: 'amethyst',  img: '/images/amethyst.png',  label: 'Аметистовая жеода',   desc: 'Магические кристаллы' },
]

// Статичный массив пустых слотов — не пересоздаётся
const EMPTY_SLOTS = Array.from({ length: 16 }, (_, i) => i + 100)

// Tooltip мемоизирован — не рендерится если пропсы не изменились
const Tooltip = memo(function Tooltip({ label, desc }) {
  return (
    <div className="mc-tooltip">
      <span className="mc-tooltip-title">{label}</span>
      {desc && <span className="mc-tooltip-desc">{desc}</span>}
    </div>
  )
})

// Slot мемоизирован — не рендерится при изменениях несвязанных слотов
const Slot = memo(function Slot({ world, onSelectWorld }) {
  const [hovered, setHovered] = useState(false)

  const handleClick = useCallback(() => {
    if (world) onSelectWorld(world.id)
  }, [world, onSelectWorld])

  const handleEnter = useCallback(() => {
    if (world) setHovered(true)
  }, [world])

  const handleLeave = useCallback(() => setHovered(false), [])

  return (
    <div
      className="inventory-slot"
      style={{ position: 'relative', overflow: 'visible' }}
      onClick={world ? handleClick : undefined}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {world && (
        <div style={{
          position: 'absolute',
          inset: '5%',
          backgroundImage: `url(${world.img})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          imageRendering: 'pixelated',
          overflow: 'hidden',
        }} />
      )}
      {hovered && world && <Tooltip label={world.label} desc={world.desc} />}
    </div>
  )
})

export const ChestInventory = memo(function ChestInventory({ open, onClose, onSelectWorld }) {
  if (!open) return null

  return (
    <div className="inventory-overlay" onClick={onClose}>
      <div className="inventory-window" onClick={e => e.stopPropagation()}>
        <button className="inventory-close" onClick={onClose}>✕</button>
        <div className="inventory-section-title">Сундук</div>
        <div className="inventory-grid">
          {WORLDS.map(w => (
            <Slot key={w.id} world={w} onSelectWorld={onSelectWorld} />
          ))}
          {EMPTY_SLOTS.map(i => (
            <Slot key={i} />
          ))}
        </div>
      </div>
    </div>
  )
})
