<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { Period, WeightEntry } from '../types'
import { useProfileStore } from '../stores/profile'
import { useWeightsStore } from '../stores/weights'
import { bmiColor, bmiLabel, bmiValue } from '../utils/bmi'
import { formatDayMonth, isAfterToday, isDateInput, parseDateOnly, toDateInput } from '../utils/dates'
import { parseDecimal, round1, signedKg } from '../utils/number'
import { buildChart, deltaMessage, goalProgress } from '../utils/weight'
import BmiScale from './BmiScale.vue'
import BottomSheet from './BottomSheet.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import Icon from './Icon.vue'
import WeightChart from './WeightChart.vue'

const WEIGHT_MIN = 25
const WEIGHT_MAX = 350

const profile = useProfileStore()
const weights = useWeightsStore()

const period = ref<Period>('day')
const editing = ref(false)
const sheetOpen = ref(false)
const editingId = ref<string | null>(null)
const draftKg = ref('')
const draftDate = ref(toDateInput(new Date()))
const formError = ref('')
const pendingDelete = ref<WeightEntry | null>(null)

const periods: { id: Period; label: string }[] = [
  { id: 'day', label: 'День' },
  { id: 'week', label: 'Неделя' },
  { id: 'month', label: 'Месяц' },
]

const points = computed(() => buildChart(weights.items, period.value))
const message = computed(() => (weights.delta == null ? '' : deltaMessage(weights.delta)))

const goalView = computed(() => {
  if (profile.startKg == null || profile.goalKg == null) return { kind: 'missing' as const }
  if (!weights.latest) return { kind: 'need-weight' as const }
  const progress = goalProgress(profile.startKg, profile.goalKg, weights.latest.kg)
  if (progress == null) return { kind: 'invalid' as const }
  return { kind: 'ready' as const, progress }
})

const bmi = computed(() => {
  if (profile.heightCm == null || !weights.latest) return null
  const value = bmiValue(weights.latest.kg, profile.heightCm)
  if (value == null) return null
  return { value, label: bmiLabel(value), color: bmiColor(value) }
})

const bmiHint = computed(() => {
  if (profile.heightCm == null && !weights.latest) return 'Укажите рост и введите вес, чтобы посчитать ИМТ.'
  if (profile.heightCm == null) return 'Укажите рост в настройках, чтобы посчитать ИМТ.'
  return 'Введите вес, чтобы посчитать ИМТ.'
})

const sheetTitle = computed(() => (editingId.value ? 'Изменить вес' : 'Вес'))
const today = toDateInput(new Date())

function deltaAt(index: number): number | null {
  const current = weights.sortedDesc[index]
  const older = weights.sortedDesc[index + 1]
  if (!current || !older) return null
  return round1(current.kg - older.kg)
}

function openCreate() {
  editingId.value = null
  draftKg.value = weights.latest ? weights.latest.kg.toFixed(1) : ''
  draftDate.value = today
  formError.value = ''
  sheetOpen.value = true
}

function openEdit(entry: WeightEntry) {
  editingId.value = entry.id
  draftKg.value = entry.kg.toFixed(1)
  draftDate.value = entry.at
  formError.value = ''
  sheetOpen.value = true
}

function saveWeight() {
  const kg = parseDecimal(draftKg.value)
  if (kg == null) {
    formError.value = 'Введите вес, например 102.5'
    return
  }
  const rounded = round1(kg)
  if (rounded < WEIGHT_MIN || rounded > WEIGHT_MAX) {
    formError.value = `Допустимый вес — от ${WEIGHT_MIN} до ${WEIGHT_MAX} кг.`
    return
  }
  if (!isDateInput(draftDate.value)) {
    formError.value = 'Укажите дату взвешивания.'
    return
  }
  if (isAfterToday(draftDate.value)) {
    formError.value = 'Дата не может быть в будущем.'
    return
  }
  if (editingId.value) weights.update(editingId.value, draftDate.value, rounded)
  else weights.add(draftDate.value, rounded)
  sheetOpen.value = false
}

function confirmDelete() {
  if (!pendingDelete.value) return
  weights.remove(pendingDelete.value.id)
  pendingDelete.value = null
  if (weights.items.length === 0) editing.value = false
}
</script>

<template>
  <div class="stack">
    <section class="card">
      <h2>Последние данные</h2>
      <template v-if="weights.latest">
        <div class="latest">
          <p class="latest__value nums">
            {{ weights.latest.kg.toFixed(1) }}
            <span>кг</span>
          </p>
          <p
            v-if="weights.delta != null"
            class="delta nums"
            :class="{
              'delta--down': weights.delta < 0,
              'delta--up': weights.delta > 0,
            }"
          >
            <Icon v-if="weights.delta < 0" name="arrowDown" :size="16" />
            <Icon v-else-if="weights.delta > 0" name="arrowUp" :size="16" />
            {{ signedKg(weights.delta) }}
          </p>
        </div>
        <p v-if="message" class="note">{{ message }}</p>
        <button class="btn" type="button" @click="openCreate">Обновить</button>
      </template>
      <template v-else>
        <p class="muted block">Пока нет записей о весе.</p>
        <button class="btn" type="button" @click="openCreate">Ввести вес</button>
      </template>
    </section>

    <section class="card">
      <div class="card__head">
        <h2>Цель</h2>
        <RouterLink class="icon-chip" to="/body/settings" aria-label="Настроить цель">
          <Icon name="pencil" :size="16" />
        </RouterLink>
      </div>

      <template v-if="goalView.kind === 'ready' && profile.startKg != null && profile.goalKg != null && weights.latest">
        <div class="goal">
          <p
            class="goal__bubble nums"
            :class="{ 'is-start': goalView.progress < 18, 'is-end': goalView.progress > 82 }"
            :style="{ left: `${goalView.progress}%` }"
          >
            {{ weights.latest.kg.toFixed(1) }} кг
          </p>
          <div class="goal__track">
            <div class="goal__fill" :class="{ 'is-empty': goalView.progress === 0 }" :style="{ width: `${goalView.progress}%` }" />
          </div>
          <div class="goal__values nums">
            <span>{{ profile.startKg.toFixed(1) }} кг</span>
            <span class="goal__arrows" aria-hidden="true">»</span>
            <span>{{ profile.goalKg.toFixed(1) }} кг</span>
          </div>
          <div class="goal__captions">
            <span>Начало</span>
            <span class="nums">{{ goalView.progress }}%</span>
            <span>Цель</span>
          </div>
        </div>
      </template>
      <template v-else>
        <p class="muted block">
          <template v-if="goalView.kind === 'invalid'">Желаемый вес должен быть меньше начального.</template>
          <template v-else-if="goalView.kind === 'need-weight'">Введите текущий вес, чтобы увидеть прогресс.</template>
          <template v-else>Укажите начальный и желаемый вес.</template>
        </p>
        <RouterLink class="btn" to="/body/settings">Настроить</RouterLink>
      </template>
    </section>

    <section class="card">
      <div class="card__head">
        <h2>ИМТ (кг/м²)</h2>
        <RouterLink class="icon-chip" to="/body/settings" aria-label="Изменить рост">
          <Icon name="pencil" :size="16" />
        </RouterLink>
      </div>
      <template v-if="bmi">
        <div class="bmi">
          <p class="bmi__value nums">{{ bmi.value.toFixed(2) }}</p>
          <p class="bmi__label" :style="{ color: bmi.color }">{{ bmi.label }}</p>
        </div>
        <BmiScale :value="bmi.value" />
      </template>
      <p v-else class="muted">{{ bmiHint }}</p>
    </section>

    <section class="card">
      <div class="card__head">
        <h2>История</h2>
        <button
          v-if="weights.items.length"
          class="icon-chip"
          type="button"
          :aria-pressed="editing"
          aria-label="Редактировать историю"
          @click="editing = !editing"
        >
          <Icon name="pencil" :size="16" />
        </button>
      </div>

      <div class="periods" role="tablist" aria-label="Период графика">
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

      <template v-if="points.length">
        <WeightChart :points="points" :goal-kg="profile.goalKg" />
        <p v-if="editing" class="muted block">Измените или удалите запись.</p>
        <ul class="entries">
          <li v-for="(entry, index) in weights.sortedDesc" :key="entry.id" class="entry">
            <div>
              <p class="entry__title nums">{{ entry.kg.toFixed(1) }} кг</p>
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
                {{ signedKg(deltaAt(index) ?? 0) }}
              </p>
              <div v-if="editing" class="entry__actions">
                <button type="button" @click="openEdit(entry)">Изменить</button>
                <button type="button" class="danger" @click="pendingDelete = entry">Удалить</button>
              </div>
            </div>
          </li>
        </ul>
      </template>
      <p v-else class="muted">График появится после первой записи.</p>
    </section>

    <BottomSheet :open="sheetOpen" :title="sheetTitle" @close="sheetOpen = false">
      <form class="stack" @submit.prevent="saveWeight">
        <label class="field">
          <span>Вес, кг</span>
          <input v-model="draftKg" inputmode="decimal" autocomplete="off" placeholder="102.0" />
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
      :text="pendingDelete ? `Вес ${pendingDelete.kg.toFixed(1)} кг за ${formatDayMonth(parseDateOnly(pendingDelete.at))} будет удалён.` : ''"
      confirm-label="Удалить"
      danger
      @close="pendingDelete = null"
      @confirm="confirmDelete"
    />
  </div>
</template>
