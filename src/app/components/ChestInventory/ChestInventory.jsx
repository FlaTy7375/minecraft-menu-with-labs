import { useState } from 'react'
import './ChestInventory.css'

const WORLDS = [
  { id: 'default', img: '/images/dirt.webp',    label: 'Обычный мир',  desc: 'Зелёные луга и закат' },
  { id: 'desert',  img: '/images/desert.png',   label: 'Пустыня',      desc: 'Жаркий полдень и песок' },
  { id: 'snow',    img: '/images/snow.png',     label: 'Снежный мир',  desc: 'Холодные просторы' },
  { id: 'jungle',  img: '/images/лианы.webp',   label: 'Джунгли',      desc: 'Тропический лес' },
  { id: 'ocean',    img: '/images/fish.webp',     label: 'Океан',         desc: 'Подводный монумент' },
  { id: 'mushroom', img: '/images/mushroom.png',  label: 'Грибной остров', desc: 'Мистический остров' },
  { id: 'nether',   img: '/images/obsidian.webp', label: 'Незер',          desc: 'Огненное измерение' },
  { id: 'end',      img: '/images/end.webp',      label: 'Край',           desc: 'Измерение Дракона' },
]

function Tooltip({ label, desc }) {
  return (
    <div className="mc-tooltip">
      <span className="mc-tooltip-title">{label}</span>
      {desc && <span className="mc-tooltip-desc">{desc}</span>}
    </div>
  )
}

function Slot({ world, activeWorld, onSelectWorld }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="inventory-slot"
      style={{ position: 'relative', overflow: 'visible' }}
      onClick={world ? () => onSelectWorld(world.id) : undefined}
      onMouseEnter={() => world && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
}

export function ChestInventory({ open, onClose, onSelectWorld, activeWorld }) {
  if (!open) return null

  return (
    <div className="inventory-overlay" onClick={onClose}>
      <div className="inventory-window" onClick={e => e.stopPropagation()}>
        <button className="inventory-close" onClick={onClose}>✕</button>
        <div className="inventory-section-title">Сундук</div>
        <div className="inventory-grid">
          {WORLDS.map(w => (
            <Slot key={w.id} world={w} activeWorld={activeWorld} onSelectWorld={onSelectWorld} />
          ))}
          {Array.from({ length: 19 }).map((_, i) => (
            <Slot key={i + 2} />
          ))}
        </div>
      </div>
    </div>
  )
}
