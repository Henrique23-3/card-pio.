import './PWABadge.css'

import { useRegisterSW } from 'virtual:pwa-register/react'

function PWABadge() {
  // periodic sync is disabled, change the value to enable it, the period is in milliseconds
// You can remove onRegisteredSW callback and registerPeriodicSync function
  const period = 0

  const {
    
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (period <= 0) return
      if (r?.active?.state === 'activated') {
        registerPeriodicSync(period, swUrl, r)
      }
      else if (r?.installing) {
        r.installing.addEventListener('statechange', (e) => {
          /** @type {ServiceWorker} */
          const sw = e.target
          if (sw.state === 'activated')
            registerPeriodicSync(period, swUrl, r)
        })
      }
    },
  })

  function close() {
    
    setNeedRefresh(false)
  }

  return (
    <div className="PWABadge" role="alert" aria-labelledby="toast-message">
      { (needRefresh)
      && (
        <div className="PWABadge-toast">
          <div className="PWABadge-message">
            <span id="toast-message">Uma nova versão do cardápio está disponível.</span>
              
              
          </div>
          <div className="PWABadge-buttons">
            <button className="PWABadge-toast-button" onClick={() => updateServiceWorker(true)}>Atualizar</button>
            <button className="PWABadge-toast-button" onClick={() => close()}>Depois</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PWABadge

/**
 * This function will register a periodic sync check every hour, you can modify the interval as needed.
 * @param period {number}
 * @param swUrl {string}
 * @param r {ServiceWorkerRegistration}
 */
function registerPeriodicSync(period, swUrl, r) {
  if (period <= 0) return

  setInterval(async () => {
    if ('onLine' in navigator && !navigator.onLine)
      return

    const resp = await fetch(swUrl, {
      cache: 'no-store',
      headers: {
        'cache': 'no-store',
        'cache-control': 'no-cache',
      },
    })

    if (resp?.status === 200)
      await r.update()
  }, period)
}
