<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { chartBounds, type ChartPoint } from '../utils/weight'

const props = withDefaults(defineProps<{
  points: ChartPoint[]
  goalKg: number | null
  unit?: string
  caption?: string
}>(), {
  unit: 'кг',
  caption: 'График веса',
})

const width = 360
const height = 220
const pad = { l: 36, r: 14, t: 34, b: 28 }
const gradientId = `weight-fill-${useId().replace(/\W/g, '')}`
const selected = ref(0)

watch(() => props.points.map((point) => `${point.at}:${point.kg}:${point.label}`).join('|'), () => {
  selected.value = Math.max(0, props.points.length - 1)
}, { immediate: true })

const bounds = computed(() => {
  const values = props.points.map((point) => point.kg)
  if (props.goalKg != null) values.push(props.goalKg)
  if (values.length === 0) return { min: 0, max: 1, step: 1 }
  return chartBounds(values)
})

const yTicks = computed(() => {
  const ticks: number[] = []
  const { min, max, step } = bounds.value
  for (let value = min; value <= max + step / 100; value += step) ticks.push(Math.round(value))
  return ticks
})

function xAt(index: number): number {
  const plot = width - pad.l - pad.r
  if (props.points.length <= 1) return pad.l + plot / 2
  return pad.l + (index / (props.points.length - 1)) * plot
}

function yAt(kg: number): number {
  const { min, max } = bounds.value
  const span = max - min || 1
  return pad.t + (1 - (kg - min) / span) * (height - pad.t - pad.b)
}

const coords = computed(() => props.points.map((point, index) => ({
  ...point,
  x: xAt(index),
  y: yAt(point.kg),
})))

const linePath = computed(() => coords.value.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' '))

const areaPath = computed(() => {
  const points = coords.value
  if (points.length < 2) return ''
  const base = height - pad.b
  const last = points[points.length - 1]!
  const first = points[0]!
  return `${linePath.value} L ${last.x.toFixed(1)} ${base} L ${first.x.toFixed(1)} ${base} Z`
})

const goalY = computed(() => (props.goalKg == null ? null : yAt(props.goalKg)))

const tip = computed(() => {
  const point = coords.value[selected.value]
  if (!point) return null
  const label = `${point.kg.toFixed(1)} ${props.unit}`
  const box = Math.max(76, label.length * 7.4 + 20)
  const half = box / 2
  const x = Math.min(width - 8 - half, Math.max(8 + half, point.x))
  const above = point.y >= 56
  return { x, y: above ? point.y - 16 : point.y + 30, box, label }
})

function showLabel(index: number): boolean {
  const total = props.points.length
  if (total <= 8) return true
  if (index === 0 || index === total - 1) return true
  return index % Math.ceil(total / 6) === 0
}

function select(index: number) {
  selected.value = index
}
</script>

<template>
  <svg class="chart" :viewBox="`0 0 ${width} ${height}`" role="img" :aria-label="caption">
    <defs>
      <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.38" />
        <stop offset="100%" stop-color="var(--accent)" stop-opacity="0" />
      </linearGradient>
    </defs>

    <line
      v-for="tick in yTicks"
      :key="tick"
      :x1="pad.l"
      :x2="width - pad.r"
      :y1="yAt(tick)"
      :y2="yAt(tick)"
      class="chart__grid"
    />
    <text
      v-for="tick in yTicks"
      :key="`label-${tick}`"
      :x="pad.l - 6"
      :y="yAt(tick) + 4"
      class="chart__ylabel"
    >{{ tick }}</text>

    <template v-if="goalY != null && goalKg != null">
      <line :x1="pad.l" :x2="width - pad.r" :y1="goalY" :y2="goalY" class="chart__goal" />
      <text :x="pad.l + 4" :y="goalY - 6" class="chart__goal-label">{{ goalKg.toFixed(1) }} {{ unit }}</text>
    </template>

    <path v-if="areaPath" :d="areaPath" :fill="`url(#${gradientId})`" />
    <path v-if="coords.length > 1" :d="linePath" class="chart__line" />

    <g v-for="(point, index) in coords" :key="point.at">
      <circle
        :cx="point.x"
        :cy="point.y"
        r="14"
        class="chart__hit"
        role="button"
        tabindex="0"
        :aria-label="`${point.label}: ${point.kg.toFixed(1)} ${unit}`"
        :aria-pressed="index === selected"
        @click="select(index)"
        @keydown.enter.prevent="select(index)"
        @keydown.space.prevent="select(index)"
      />
      <circle
        :cx="point.x"
        :cy="point.y"
        :r="index === selected ? 5.5 : 3.5"
        :class="index === selected ? 'chart__dot chart__dot--active' : 'chart__dot'"
      />
      <text
        v-if="showLabel(index)"
        :x="point.x"
        :y="height - 8"
        class="chart__xlabel"
      >{{ point.label }}</text>
    </g>

    <g v-if="tip" :transform="`translate(${tip.x}, ${tip.y})`">
      <rect :x="-tip.box / 2" y="-18" :width="tip.box" height="22" rx="11" class="chart__tip" />
      <text text-anchor="middle" y="-3" class="chart__tip-text">{{ tip.label }}</text>
    </g>
  </svg>
</template>
