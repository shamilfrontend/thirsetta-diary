<script setup lang="ts">
import { computed, watch } from 'vue'
import { DOSE_LEVELS, doseColor, formatDose, pastDoseLine, type DoseMg } from '../utils/doses'
import { parseInteger } from '../utils/number'

const dose = defineModel<DoseMg | null>('dose', { required: true })
const earlier = defineModel<boolean>('earlier', { required: true })
const earlyDose = defineModel<DoseMg | null>('earlyDose', { required: true })
const earlyCount = defineModel<string>('earlyCount', { required: true })

const props = defineProps<{
  totalRaw: string
  idPrefix: string
  invalid?: string
}>()

const total = computed(() => parseInteger(props.totalRaw))
const canSplit = computed(() => {
  const count = total.value
  return count != null && count > 1
})

watch(earlier, (on) => {
  if (!on || earlyCount.value.trim() !== '') return
  const count = total.value
  earlyCount.value = count != null && count > 1 ? String(Math.min(4, count - 1)) : '4'
})

const summary = computed(() => {
  const count = total.value
  const current = dose.value
  const firstDose = earlyDose.value
  const first = parseInteger(earlyCount.value)
  if (!earlier.value || count == null || count < 2 || current == null || firstDose == null) return ''
  if (first == null || first < 1 || first >= count || firstDose === current) return ''
  return pastDoseLine(count, current, { mg: firstDose, count: first })
})
</script>

<template>
  <div :id="`${idPrefix}-dose`" class="field">
    <span :id="`${idPrefix}-dose-label`">Текущая доза</span>
    <div class="dose-list" role="radiogroup" :aria-labelledby="`${idPrefix}-dose-label`" :class="{ 'is-invalid': invalid === 'dose' }">
      <button
        v-for="mg in DOSE_LEVELS"
        :key="mg"
        type="button"
        role="radio"
        :aria-checked="dose === mg"
        :class="{ active: dose === mg }"
        :style="{ '--dose': doseColor(mg) }"
        @click="dose = mg"
      >
        {{ formatDose(mg) }}
      </button>
    </div>
    <p v-if="summary" class="fine">{{ summary }}</p>
    <p v-else-if="earlier" class="fine">Последние уколы запишутся с этой дозой.</p>
    <p v-else class="fine">Если выбрана, запишется на эти уколы.</p>
  </div>
  <button v-if="canSplit && !earlier" type="button" class="past-split" @click="earlier = true">
    Сначала была другая доза
  </button>
  <template v-if="canSplit && earlier">
    <div :id="`${idPrefix}-early`" class="field">
      <span :id="`${idPrefix}-early-label`">Доза первых уколов</span>
      <div class="dose-list" role="radiogroup" :aria-labelledby="`${idPrefix}-early-label`" :class="{ 'is-invalid': invalid === 'early' }">
        <button
          v-for="mg in DOSE_LEVELS"
          :key="mg"
          type="button"
          role="radio"
          :aria-checked="earlyDose === mg"
          :class="{ active: earlyDose === mg }"
          :style="{ '--dose': doseColor(mg) }"
          @click="earlyDose = mg"
        >
          {{ formatDose(mg) }}
        </button>
      </div>
    </div>
    <label :id="`${idPrefix}-early-count`" class="field">
      <span>Сколько первых уколов</span>
      <input
        v-model="earlyCount"
        :class="{ 'is-invalid': invalid === 'early-count' }"
        :aria-invalid="invalid === 'early-count'"
        inputmode="numeric"
        autocomplete="off"
      />
    </label>
    <button type="button" class="text-btn past-split__back" @click="earlier = false">Одна доза на все уколы</button>
  </template>
</template>
