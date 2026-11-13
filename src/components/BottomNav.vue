<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Icon from './Icon.vue'
</script>

<template>
  <nav class="nav" aria-label="Разделы">
    <RouterLink to="/">
      <Icon name="syringe" :size="22" />
      <span>Уколы</span>
    </RouterLink>
    <RouterLink to="/body">
      <Icon name="person" :size="22" />
      <span>Тело</span>
    </RouterLink>
    <RouterLink to="/instructions">
      <Icon name="book" :size="22" />
      <span>Инструкции</span>
    </RouterLink>
    <RouterLink to="/settings">
      <Icon name="gear" :size="22" />
      <span>Настройки</span>
    </RouterLink>
  </nav>
</template>
