import { App as CapApp } from '@capacitor/app'
import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { persistPlugin } from './plugins/persist'
import { router } from './router'
import './style.css'

const pinia = createPinia()
pinia.use(persistPlugin)

const app = createApp(App)
app.use(pinia)
app.use(router)

if (!Capacitor.isNativePlatform()) {
  void import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true })
  })
}

if (Capacitor.isNativePlatform()) {
  void SystemBars.setStyle({ style: SystemBarsStyle.Dark })
  void CapApp.addListener('backButton', () => {
    if (document.querySelector('[role="dialog"]')) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      return
    }
    const back = (window.history.state as { back?: unknown } | null)?.back
    if (back) void router.back()
    else void CapApp.exitApp()
  })
}

router.isReady().then(() => {
  app.mount('#app')
})
