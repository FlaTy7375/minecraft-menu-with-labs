import './ChestInventory.css'

function Slot() {
  return <div className="inventory-slot" />
}

export function ChestInventory({ open, onClose }) {
  if (!open) return null

  return (
    <div className="inventory-overlay" onClick={onClose}>
      <div className="inventory-window" onClick={e => e.stopPropagation()}>
        <button className="inventory-close" onClick={onClose}>✕</button>
        <div className="inventory-section-title">ЛР по ПиРweb-пр</div>
        <div className="inventory-grid">
          {Array.from({ length: 27 }).map((_, i) => <Slot key={i} />)}
        </div>
      </div>
    </div>
  )
}
