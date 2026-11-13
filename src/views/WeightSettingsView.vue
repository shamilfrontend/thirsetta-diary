<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import BottomSheet from '../components/BottomSheet.vue'
import Icon from '../components/Icon.vue'
import { useProfileStore } from '../stores/profile'
import type { UnitSystem } from '../types'
import { cmToFtIn, formatHeight, formatWeight, ftInToCm, kgToLb, lbToKg } from '../utils/units'
import { parseDecimal, parseInteger, round1 } from '../utils/number'

const HEIGHT_MIN = 80
const HEIGHT_MAX = 250
const WEIGHT_MIN = 25
const WEIGHT_MAX = 350

type Field = 'height' | 'goal' | 'start'

const router = useRouter()
const profile = useProfileStore()
const field = ref<Field | null>(null)
const metricDraft = ref('')
const feetDraft = ref('')
const inchesDraft = ref('')
const initialImperial = ref('')
const error = ref('')

const titles: Record<Field, string> = {
  height: 'Рост',
  goal: 'Желаемый вес',
  start: 'Начальный вес',
}

const imperial = () => profile.unit === 'imperial'

function shown(kind: Field): string {
  if (kind === 'height') return profile.heightCm == null ? 'Не указано' : formatHeight(profile.heightCm, imperial())
  const value = kind === 'goal' ? profile.goalKg : profile.startKg
  return value == null ? 'Не указано' : formatWeight(value, imperial())
}

function open(next: Field) {
  field.value = next
  error.value = ''
  initialImperial.value = ''
  if (next === 'height') {
    if (imperial() && profile.heightCm != null) {
      const parts = cmToFtIn(profile.heightCm)
      feetDraft.value = String(parts.ft)
      inchesDraft.value = String(parts.inches)
      initialImperial.value = `${parts.ft}:${parts.inches}`
    } else {
      feetDraft.value = ''
      inchesDraft.value = ''
      metricDraft.value = profile.heightCm == null ? '' : profile.heightCm.toFixed(1)
    }
    return
  }
  const current = next === 'goal' ? profile.goalKg : profile.startKg
  metricDraft.value = current == null ? '' : imperial() ? kgToLb(current).toFixed(1) : current.toFixed(1)
  if (current != null && imperial()) initialImperial.value = kgToLb(current).toFixed(1)
}

function close() {
  field.value = null
}

function saveWeightField(next: 'goal' | 'start') {
  const parsed = parseDecimal(metricDraft.value)
  if (parsed == null) {
    error.value = 'Введите число, например 85.0'
    return
  }
  const current = next === 'goal' ? profile.goalKg : profile.startKg
  if (imperial()) {
    if (current != null && round1(parsed) === round1(kgToLb(current))) {
      close()
      return
    }
    const kg = round1(lbToKg(parsed))
    if (kg < WEIGHT_MIN || kg > WEIGHT_MAX) {
      error.value = `Получилось ${kg.toFixed(1)} кг. Допустимо от ${WEIGHT_MIN} до ${WEIGHT_MAX} кг.`
      return
    }
    if (next === 'goal') profile.setGoal(kg)
    else profile.setStart(kg)
    close()
    return
  }
  const kg = round1(parsed)
  if (kg < WEIGHT_MIN || kg > WEIGHT_MAX) {
    error.value = `Допустимо от ${WEIGHT_MIN} до ${WEIGHT_MAX} кг.`
    return
  }
  if (next === 'goal') profile.setGoal(kg)
  else profile.setStart(kg)
  close()
}

function saveHeight() {
  if (imperial()) {
    const ft = parseInteger(feetDraft.value)
    const inches = parseInteger(inchesDraft.value)
    if (ft == null || inches == null || inches > 11) {
      error.value = 'Укажите футы и дюймы от 0 до 11.'
      return
    }
    if (profile.heightCm != null && `${ft}:${inches}` === initialImperial.value) {
      close()
      return
    }
    const cm = round1(ftInToCm(ft, inches))
    if (cm < HEIGHT_MIN || cm > HEIGHT_MAX) {
      error.value = `Получилось ${cm.toFixed(1)} см. Допустимо от ${HEIGHT_MIN} до ${HEIGHT_MAX} см.`
      return
    }
    profile.setHeight(cm)
    close()
    return
  }
  const parsed = parseDecimal(metricDraft.value)
  if (parsed == null) {
    error.value = 'Введите рост, например 176.0'
    return
  }
  const cm = round1(parsed)
  if (cm < HEIGHT_MIN || cm > HEIGHT_MAX) {
    error.value = `Допустимо от ${HEIGHT_MIN} до ${HEIGHT_MAX} см.`
    return
  }
  profile.setHeight(cm)
  close()
}

function save() {
  if (field.value === 'height') saveHeight()
  else if (field.value === 'goal' || field.value === 'start') saveWeightField(field.value)
}

function setUnit(next: UnitSystem) {
  profile.setUnit(next)
}
</script>

<template>
  <div class="page stack">
    <AppHeader title="Вес" back @back="router.push('/body')" />

    <div class="unit-toggle" role="group" aria-label="Единицы измерения">
      <button type="button" :class="{ active: profile.unit === 'metric' }" @click="setUnit('metric')">cm/kg</button>
      <button type="button" :class="{ active: profile.unit === 'imperial' }" @click="setUnit('imperial')">ft/lb</button>
    </div>
    <p class="muted">На экране веса значения остаются в килограммах. Здесь меняется только ввод роста и цели.</p>

    <div class="settings">
      <button class="settings__row" type="button" @click="open('height')">
        <span class="settings__icon"><Icon name="ruler" :size="18" /></span>
        <span>Рост</span>
        <strong :class="{ 'is-empty': profile.heightCm == null }">{{ shown('height') }}</strong>
        <Icon name="chevron" :size="18" />
      </button>
      <button class="settings__row" type="button" @click="open('goal')">
        <span class="settings__icon"><Icon name="flag" :size="18" /></span>
        <span>Желаемый вес</span>
        <strong :class="{ 'is-empty': profile.goalKg == null }">{{ shown('goal') }}</strong>
        <Icon name="chevron" :size="18" />
      </button>
      <button class="settings__row" type="button" @click="open('start')">
        <span class="settings__icon"><Icon name="scale" :size="18" /></span>
        <span>Начальный вес</span>
        <strong :class="{ 'is-empty': profile.startKg == null }">{{ shown('start') }}</strong>
        <Icon name="chevron" :size="18" />
      </button>
    </div>

    <BottomSheet :open="field != null" :title="field ? titles[field] : ''" @close="close">
      <form class="stack" @submit.prevent="save">
        <div v-if="field === 'height' && imperial()" class="pair">
          <label class="field">
            <span>Футы</span>
            <input v-model="feetDraft" inputmode="numeric" autocomplete="off" />
          </label>
          <label class="field">
            <span>Дюймы</span>
            <input v-model="inchesDraft" inputmode="numeric" autocomplete="off" />
          </label>
        </div>
        <label v-else class="field">
          <span>{{ field === 'height' ? 'Рост, cm' : imperial() ? 'Вес, lb' : 'Вес, kg' }}</span>
          <input v-model="metricDraft" inputmode="decimal" autocomplete="off" />
        </label>
        <p v-if="error" class="error">{{ error }}</p>
        <button class="btn" type="submit">Сохранить</button>
      </form>
    </BottomSheet>
  </div>
</template>
