<script setup lang="ts">
import { computed, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import BottomNav from './components/BottomNav.vue'
import InstallHint from './components/InstallHint.vue'
import ToastHost from './components/ToastHost.vue'
import { useProfileStore } from './stores/profile'
import { doseColor } from './utils/doses'

const route = useRoute()
const profile = useProfileStore()
const showNav = computed(
  () => route.name === 'home' || route.name === 'body' || route.name === 'instructions' || route.name === 'preferences',
)

watch(
  () => profile.doseMg,
  (mg) => {
    document.documentElement.style.setProperty('--accent', doseColor(mg))
  },
  { immediate: true },
)
</script>

<template>
  <div class="shell" :class="{ 'shell--nav': showNav }">
    <InstallHint />
    <RouterView />
    <BottomNav v-if="showNav" />
    <ToastHost />
  </div>
</template>
