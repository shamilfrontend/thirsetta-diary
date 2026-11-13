<script setup lang="ts">
import { onUnmounted, watch } from 'vue'
import Icon from './Icon.vue'

const props = defineProps<{
  open: boolean
  title: string
}>()

const emit = defineEmits<{
  close: []
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
  <div v-if="open" class="overlay" @click.self="emit('close')">
    <div class="sheet" role="dialog" aria-modal="true" :aria-label="title">
      <div class="sheet__handle" />
      <div class="sheet__head">
        <h2>{{ title }}</h2>
        <button class="icon-btn" type="button" aria-label="Закрыть" @click="emit('close')">
          <Icon name="close" />
        </button>
      </div>
      <slot />
    </div>
  </div>
</template>
