<script setup lang="ts">
import { Capacitor } from '@capacitor/core'
import { onUnmounted, ref } from 'vue'
import Icon from './Icon.vue'

const DISMISS_KEY = 'tirzetta:install-dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type InstallMode = 'prompt' | 'ios'

const mode = ref<InstallMode | null>(null)
const deferred = ref<BeforeInstallPromptEvent | null>(null)

function isStandalone() {
  const nav = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
}

function isIos() {
  const ua = navigator.userAgent
  return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
}

function isDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

function canOffer() {
  return !Capacitor.isNativePlatform() && !isStandalone() && !isDismissed()
}

function onBeforeInstallPrompt(event: Event) {
  if (!canOffer() || isIos()) return
  event.preventDefault()
  deferred.value = event as BeforeInstallPromptEvent
  mode.value = 'prompt'
}

function onInstalled() {
  mode.value = null
  deferred.value = null
}

if (canOffer()) {
  window.addEventListener('appinstalled', onInstalled)
  if (isIos()) mode.value = 'ios'
  else window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
}

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  window.removeEventListener('appinstalled', onInstalled)
})

async function install() {
  const event = deferred.value
  if (!event) return
  deferred.value = null
  try {
    await event.prompt()
    const choice = await event.userChoice
    if (choice.outcome === 'accepted') mode.value = null
  } catch {
    // Системное окно можно показать один раз. Карточка остаётся, пока её не закроют.
  }
}

function dismiss() {
  mode.value = null
  deferred.value = null
  try {
    localStorage.setItem(DISMISS_KEY, '1')
  } catch {
    // Хранилище может быть недоступно в приватном режиме.
  }
}
</script>

<template>
  <aside v-if="mode" class="install" aria-label="Установка приложения">
    <div class="install__head">
      <strong>Установить Тирзетту</strong>
      <button type="button" class="icon-btn" aria-label="Закрыть" @click="dismiss">
        <Icon name="close" :size="18" />
      </button>
    </div>
    <ol v-if="mode === 'ios'">
      <li>Нажмите «Поделиться»</li>
      <li>Выберите «На экран Домой»</li>
      <li>Нажмите «Добавить»</li>
    </ol>
    <button v-else type="button" class="btn" @click="install">Установить</button>
  </aside>
</template>
