<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Measurement, MeasureKind, Period } from '../types'
import { useMeasurementsStore } from '../stores/measurements'
import { formatDayMonth, parseDateOnly } from '../utils/dates'
import { buildMeasureChart, measureDeltaMessage } from '../utils/measure'
import { round1, signedCm } from '../utils/number'
import Icon from './Icon.vue'
import WeightChart from './WeightChart.vue'

const props = defineProps<{
  kind: MeasureKind
  title: string
  tone: string
}>()

const emit = defineEmits<{
  create: []
  edit: [entry: Measurement]
  remove: [entry: Measurement]
}>()

const measurements = useMeasurementsStore()
const period = ref<Period>('day')
const editing = ref(false)

const periods: { id: Period; label: string }[] = [
  { id: 'day', label: 'День' },
  { id: 'week', label: 'Неделя' },
  { id: 'month', label: 'Месяц' },
]

const entries = computed(() => measurements.sortedDesc(props.kind))
const latest = computed(() => entries.value[0] ?? null)
const delta = computed(() => measurements.deltaOf(props.kind))
const message = computed(() => (delta.value == null ? '' : measureDeltaMessage(delta.value)))
const points = computed(() => buildMeasureChart(entries.value, period.value))

watch(entries, (list) => {
  if (list.length === 0) editing.value = false
})

function deltaAt(index: number): number | null {
  const current = entries.value[index]
  const older = entries.value[index + 1]
  if (!current || !older) return null
  return round1(current.cm - older.cm)
}
</script>

<template>
  <section class="card measure-card">
    <h2>
      <span class="dot" :class="`dot--${tone}`" />
      {{ title }}
    </h2>

    <template v-if="latest">
      <div class="latest">
        <p class="latest__value nums">
          {{ latest.cm.toFixed(1) }}
          <span>см</span>
        </p>
        <p
          v-if="delta != null"
          class="delta nums"
          :class="{
            'delta--down': delta < 0,
            'delta--up': delta > 0,
          }"
        >
          <Icon v-if="delta < 0" name="arrowDown" :size="16" />
          <Icon v-else-if="delta > 0" name="arrowUp" :size="16" />
          {{ signedCm(delta) }}
        </p>
      </div>
      <p v-if="message" class="note">{{ message }}</p>
      <button class="btn" :class="`btn--${tone}`" type="button" @click="emit('create')">Обновить</button>

      <div class="card__head measure-history">
        <h2>История</h2>
        <button
          class="icon-chip"
          type="button"
          :aria-pressed="editing"
          :aria-label="`Редактировать историю: ${title}`"
          @click="editing = !editing"
        >
          <Icon name="pencil" :size="16" />
        </button>
      </div>

      <div class="periods" role="tablist" :aria-label="`Период графика: ${title}`">
        <button
          v-for="item in periods"
          :key="item.id"
          type="button"
          role="tab"
          :aria-selected="period === item.id"
          :class="{ active: period === item.id }"
          @click="period = item.id"
        >
          {{ item.label }}
        </button>
      </div>

      <WeightChart
        v-if="points.length"
        :points="points"
        :goal-kg="null"
        unit="см"
        :caption="`График: ${title}`"
      />
      <p v-if="editing" class="muted block">Измените или удалите запись.</p>
      <ul class="entries">
        <li v-for="(entry, index) in entries" :key="entry.id" class="entry">
          <div>
            <p class="entry__title nums">{{ entry.cm.toFixed(1) }} см</p>
            <p class="muted">{{ formatDayMonth(parseDateOnly(entry.at)) }}</p>
          </div>
          <div class="entry__side">
            <p
              v-if="deltaAt(index) != null"
              class="delta nums"
              :class="{
                'delta--down': (deltaAt(index) ?? 0) < 0,
                'delta--up': (deltaAt(index) ?? 0) > 0,
              }"
            >
              <Icon v-if="(deltaAt(index) ?? 0) < 0" name="arrowDown" :size="16" />
              <Icon v-else-if="(deltaAt(index) ?? 0) > 0" name="arrowUp" :size="16" />
              {{ signedCm(deltaAt(index) ?? 0) }}
            </p>
            <div v-if="editing" class="entry__actions">
              <button type="button" @click="emit('edit', entry)">Изменить</button>
              <button type="button" class="danger" @click="emit('remove', entry)">Удалить</button>
            </div>
          </div>
        </li>
      </ul>
    </template>

    <template v-else>
      <div class="measure-card__body">
        <svg class="ghost" viewBox="0 0 320 140" aria-hidden="true">
          <path d="M10 90 C 60 88, 90 70, 130 74 S 200 100, 250 78 S 300 60, 310 64" fill="none" stroke="currentColor" stroke-width="3" />
          <path d="M10 110 H310" stroke="currentColor" stroke-dasharray="4 6" stroke-width="1.5" />
        </svg>
        <button class="btn" :class="`btn--${tone}`" type="button" :aria-label="`Ввести данные: ${title}`" @click="emit('create')">
          Ввести данные
        </button>
      </div>
      <p class="muted center">Вы пока не ввели данные</p>
    </template>
  </section>
</template>
