import type { PiniaPluginContext } from 'pinia'

export function persistPlugin({ store }: PiniaPluginContext) {
  const storageKey = `tirzetta:${store.$id}`
  let raw: string | null = null
  try {
    raw = localStorage.getItem(storageKey)
  } catch {
    raw = null
  }
  if (raw) {
    try {
      store.$patch(JSON.parse(raw))
    } catch {
      localStorage.removeItem(storageKey)
    }
  }

  store.$subscribe((_mutation, state) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state))
    } catch {
      // Хранилище может быть недоступно в приватном режиме.
    }
  }, { detached: true })
}
