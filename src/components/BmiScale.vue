<script setup lang="ts">
import { BMI_SEGMENTS, BMI_TICKS, scalePercent } from '../utils/bmi'

defineProps<{
  value: number
}>()
</script>

<template>
  <div class="scale">
    <div class="scale__bar">
      <span
        v-for="segment in BMI_SEGMENTS"
        :key="segment.from"
        :style="{ width: `${scalePercent(segment.to) - scalePercent(segment.from)}%`, background: segment.color }"
      />
      <span class="scale__marker" :style="{ left: `${scalePercent(value)}%` }" />
    </div>
    <div class="scale__ticks">
      <span
        v-for="tick in BMI_TICKS"
        :key="tick"
        :style="{ left: `${scalePercent(tick)}%` }"
      >{{ tick }}</span>
    </div>
  </div>
</template>
