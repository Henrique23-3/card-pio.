import { useRegisterSW } from 'virtual:pwa-register/react'
import './PwaUpdate.css'

export default function PwaUpdate() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <aside className="pwa-update" role="status" aria-label="Atualização do aplicativo">
      <p>Uma nova versão do cardápio está disponível.</p>
      <div>
        <button onClick={() => updateServiceWorker(true)}>Atualizar</button>
        <button onClick={() => setNeedRefresh(false)}>Depois</button>
      </div>
    </aside>
  )
}
