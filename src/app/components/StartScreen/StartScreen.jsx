import './StartScreen.css'

export function StartScreen({ onStart }) {
  return (
    <div className="start-screen" onClick={onStart}>
      <div className="start-text">Нажмите чтобы начать</div>
    </div>
  )
}
