<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import Icon from '../components/Icon.vue'
import MeasurementPanel from '../components/MeasurementPanel.vue'
import WeightPanel from '../components/WeightPanel.vue'

const router = useRouter()
const tab = ref<'weight' | 'measure'>('weight')
</script>

<template>
  <div class="page page--nav stack">
    <AppHeader title="Данные о теле" back @back="router.push('/')">
      <template #action>
        <button class="icon-btn" type="button" aria-label="Настройки веса" @click="router.push('/body/settings')">
          <Icon name="sliders" />
        </button>
      </template>
    </AppHeader>

    <div class="segments" role="tablist" aria-label="Раздел данных о теле">
      <button type="button" role="tab" :aria-selected="tab === 'weight'" :class="{ active: tab === 'weight' }" @click="tab = 'weight'">
        Вес
      </button>
      <button type="button" role="tab" :aria-selected="tab === 'measure'" :class="{ active: tab === 'measure' }" @click="tab = 'measure'">
        Измерение
      </button>
    </div>

    <WeightPanel v-if="tab === 'weight'" />
    <MeasurementPanel v-else />
  </div>
</template>
