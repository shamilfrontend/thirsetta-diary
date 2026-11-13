<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MeasureKind, Measurement } from '../types'
import { useToast } from '../composables/useToast'
import { useMeasurementsStore } from '../stores/measurements'
import { formatDayMonth, isAfterToday, isDateInput, parseDateOnly, toDateInput } from '../utils/dates'
import { MEASURES, measureLabel } from '../utils/measure'
import { parseDecimal, round1 } from '../utils/number'
import BottomSheet from './BottomSheet.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import Icon from './Icon.vue'
import MeasureCard from './MeasureCard.vue'

const MEASURE_MIN = 20
const MEASURE_MAX = 200

const { show } = useToast()
const measurements = useMeasurementsStore()

const sheetOpen = ref(false)
const editingId = ref<string | null>(null)
const draftKind = ref<MeasureKind>('waist')
const draftCm = ref('')
const draftDate = ref(toDateInput(new Date()))
const formError = ref('')
const pendingDelete = ref<Measurement | null>(null)

const today = toDateInput(new Date())

const sheetTitle = computed(() => {
  const name = measureLabel(draftKind.value)
  return editingId.value ? name.replace('Обхват', 'Изменить обхват') : name
})

function legendValue(kind: MeasureKind): string {
  const latest = measurements.latestOf(kind)
  return latest ? `${latest.cm.toFixed(1)} см` : '-- см'
}

function howTo() {
  show('Подсказка по замерам появится позже')
}

function openCreate(kind: MeasureKind) {
  editingId.value = null
  draftKind.value = kind
  const latest = measurements.latestOf(kind)
  draftCm.value = latest ? latest.cm.toFixed(1) : ''
  draftDate.value = today
  formError.value = ''
  sheetOpen.value = true
}

function openEdit(entry: Measurement) {
  editingId.value = entry.id
  draftKind.value = entry.kind
  draftCm.value = entry.cm.toFixed(1)
  draftDate.value = entry.at
  formError.value = ''
  sheetOpen.value = true
}

function saveMeasure() {
  const cm = parseDecimal(draftCm.value)
  if (cm == null) {
    formError.value = 'Введите обхват, например 84.5'
    return
  }
  const rounded = round1(cm)
  if (rounded < MEASURE_MIN || rounded > MEASURE_MAX) {
    formError.value = `Допустимый обхват — от ${MEASURE_MIN} до ${MEASURE_MAX} см.`
    return
  }
  if (!isDateInput(draftDate.value)) {
    formError.value = 'Укажите дату замера.'
    return
  }
  if (isAfterToday(draftDate.value)) {
    formError.value = 'Дата не может быть в будущем.'
    return
  }
  if (editingId.value) measurements.update(editingId.value, draftDate.value, rounded)
  else measurements.add(draftKind.value, draftDate.value, rounded)
  sheetOpen.value = false
}

function confirmDelete() {
  if (!pendingDelete.value) return
  measurements.remove(pendingDelete.value.id)
  pendingDelete.value = null
}
</script>

<template>
  <div class="stack">
    <section class="card measure-top">
      <svg class="figure" viewBox="0 0 120 200" aria-hidden="true">
        <circle cx="60" cy="22" r="14" fill="#8ea0b8" />
        <path d="M40 46 Q36 78 44 108 H76 Q84 78 80 46 Q70 54 60 54 Q50 54 40 46" fill="#8ea0b8" />
        <path d="M40 52 L24 92" stroke="#8ea0b8" stroke-width="8" stroke-linecap="round" />
        <path d="M80 52 L96 92" stroke="#8ea0b8" stroke-width="8" stroke-linecap="round" />
        <path d="M50 108 L44 178" stroke="#8ea0b8" stroke-width="10" stroke-linecap="round" />
        <path d="M70 108 L76 178" stroke="#8ea0b8" stroke-width="10" stroke-linecap="round" />
        <ellipse cx="60" cy="64" rx="24" ry="7" fill="none" stroke="#f07a4a" stroke-width="3" />
        <ellipse cx="60" cy="86" rx="20" ry="6" fill="none" stroke="#5b8def" stroke-width="3" />
        <ellipse cx="60" cy="106" rx="23" ry="6" fill="none" stroke="#f5b942" stroke-width="3" />
        <ellipse cx="48" cy="142" rx="11" ry="6" fill="none" stroke="#b794f6" stroke-width="3" />
        <ellipse cx="74" cy="142" rx="11" ry="6" fill="none" stroke="#b794f6" stroke-width="3" />
      </svg>
      <div class="legend">
        <p v-for="item in MEASURES" :key="item.id">
          <span class="dot" :class="`dot--${item.tone}`" />
          {{ item.label }}
          <strong class="nums">{{ legendValue(item.id) }}</strong>
        </p>
      </div>
    </section>

    <button class="card how" type="button" @click="howTo">
      <span class="how__icon"><Icon name="tape" :size="20" /></span>
      <span>Как проводить измерение?</span>
      <Icon name="chevron" :size="18" />
    </button>

    <MeasureCard
      v-for="item in MEASURES"
      :key="item.id"
      :kind="item.id"
      :title="item.label"
      :tone="item.tone"
      @create="openCreate(item.id)"
      @edit="openEdit"
      @remove="pendingDelete = $event"
    />

    <BottomSheet :open="sheetOpen" :title="sheetTitle" @close="sheetOpen = false">
      <form class="stack" @submit.prevent="saveMeasure">
        <label class="field">
          <span>Обхват, см</span>
          <input v-model="draftCm" inputmode="decimal" autocomplete="off" placeholder="84.0" />
        </label>
        <label class="field">
          <span>Дата</span>
          <input v-model="draftDate" type="date" :max="today" required />
        </label>
        <p v-if="formError" class="error">{{ formError }}</p>
        <button class="btn" type="submit">Сохранить</button>
      </form>
    </BottomSheet>

    <ConfirmDialog
      :open="pendingDelete != null"
      title="Удалить запись?"
      :text="pendingDelete ? `${measureLabel(pendingDelete.kind)} ${pendingDelete.cm.toFixed(1)} см за ${formatDayMonth(parseDateOnly(pendingDelete.at))} будет удалён.` : ''"
      confirm-label="Удалить"
      danger
      @close="pendingDelete = null"
      @confirm="confirmDelete"
    />
  </div>
</template>
