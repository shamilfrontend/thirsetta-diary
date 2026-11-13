<script setup lang="ts">
import Icon from './Icon.vue'

defineProps<{
  title: string
  back?: boolean
}>()

defineEmits<{
  back: []
}>()
</script>

<template>
  <header class="header">
    <div class="header__side">
      <button v-if="back" class="icon-btn" type="button" aria-label="Назад" @click="$emit('back')">
        <Icon name="back" />
      </button>
    </div>
    <h1>{{ title }}</h1>
    <div class="header__side">
      <slot name="action" />
    </div>
  </header>
</template>
