<script setup lang="ts">
import { onUnmounted, watch } from 'vue'

const props = defineProps<{
  open: boolean
  title: string
  text: string
  confirmLabel?: string
  danger?: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

watch(() => props.open, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) window.addEventListener('keydown', onKey)
  else window.removeEventListener('keydown', onKey)
})

onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div v-if="open" class="overlay overlay--center" @click.self="emit('close')">
    <div class="dialog" role="dialog" aria-modal="true" :aria-label="title">
      <h2>{{ title }}</h2>
      <p>{{ text }}</p>
      <div class="dialog__actions">
        <button class="btn btn--ghost" type="button" @click="emit('close')">Отмена</button>
        <button class="btn" :class="{ 'btn--danger': danger }" type="button" @click="emit('confirm')">
          {{ confirmLabel ?? 'Подтвердить' }}
        </button>
      </div>
    </div>
  </div>
</template>
