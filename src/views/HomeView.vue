<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Injection } from '../types'
import { useNow } from '../composables/useNow'
import { useInjectionsStore } from '../stores/injections'
import { useWeightsStore } from '../stores/weights'
import { formatDayMonth, formatTime, isAfterToday, isDateInput, isMoreThanDaysAway, parseDateOnly, timeApart, toDateInput, WEEKDAY_SCHEDULE } from '../utils/dates'
import { cycleRatio, formatDuration, heroNumbers, parseClock } from '../utils/dose'
import { useProfileStore } from '../stores/profile'
import { doseColor, formatDose } from '../utils/doses'
import { plural } from '../utils/plural'
import { parseInteger, round1, signedKg } from '../utils/number'
import BottomSheet from '../components/BottomSheet.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import Icon from '../components/Icon.vue'

const markUrl = `${import.meta.env.BASE_URL}favicon.svg`
const injections = useInjectionsStore()
const profile = useProfileStore()
const weights = useWeightsStore()
const now = useNow()

const seedOpen = ref(false)
const seedDate = ref(toDateInput(new Date()))
const seedCount = ref('')
const seedError = ref('')
const earlyOpen = ref(false)
const pendingDelete = ref<Injection | null>(null)
const editing = ref<Injection | null>(null)
const editDate = ref('')
const editTime = ref('')
const editError = ref('')

const apart = computed(() => (injections.nextAt ? timeApart(injections.nextAt, now.value) : null))
const hero = computed(() => (apart.value ? heroNumbers(apart.value) : null))
const ratio = computed(() => {
  if (!injections.nextAt) return 0
  const last = injections.last ? new Date(injections.last.at) : null
  return cycleRatio(last, injections.nextAt, now.value)
})
const scheduleWhen = computed(() => {
  const day = profile.doseWeekday == null ? 'укол раз в неделю' : (WEEKDAY_SCHEDULE[profile.doseWeekday] ?? 'раз в неделю')
  return profile.doseTime ? `${day} в ${profile.doseTime}` : day
})
const ringOffset = computed(() => {
  const length = 2 * Math.PI * 52
  return { length, offset: length * (1 - ratio.value) }
})
const weightChange = computed(() => {
  const current = weights.latest?.kg
  if (current == null) return null
  const baseline = profile.startKg ?? (weights.sortedAsc.length >= 2 ? (weights.sortedAsc[0]?.kg ?? null) : null)
  if (baseline == null) return null
  return round1(current - baseline)
})
const dueSoon = computed(() => Boolean(apart.value && !apart.value.overdue && apart.value.days === 0 && apart.value.hours < 12))
const ringColor = computed(() => (apart.value?.overdue || dueSoon.value ? 'var(--accent)' : 'var(--green)'))

const earlyText = computed(() => {
  if (!injections.nextAt || !apart.value) return ''
  const day = profile.doseWeekday == null ? '' : (WEEKDAY_SCHEDULE[profile.doseWeekday] ?? '')
  const when = [day, profile.doseTime ? `в ${profile.doseTime}` : ''].filter(Boolean).join(' ')
  const plan = when ? `Укол запланирован ${when}.` : 'Следующий укол обычно через 7 дней.'
  return `${plan} До него ещё ${formatDuration(apart.value)}. Отметить укол сейчас?`
})

const deleteText = computed(() => {
  if (!pendingDelete.value) return ''
  const date = new Date(pendingDelete.value.at)
  return `Отметка за ${formatDayMonth(date)}, ${formatTime(date)} будет удалена.`
})

function openSeed() {
  seedDate.value = toDateInput(new Date())
  seedCount.value = ''
  seedError.value = ''
  seedOpen.value = true
}

function saveSeed() {
  if (!isDateInput(seedDate.value)) {
    seedError.value = 'Укажите дату последнего укола.'
    return
  }
  if (isAfterToday(seedDate.value, now.value)) {
    seedError.value = 'Дата укола не может быть в будущем.'
    return
  }
  const count = parseInteger(seedCount.value)
  if (count == null || count < 1 || count > 200) {
    seedError.value = 'Укажите, сколько уколов уже сделано: от 1 до 200.'
    return
  }
  injections.seed(seedDate.value, count, now.value)
  seedOpen.value = false
}

function markNow() {
  if (injections.nextAt && isMoreThanDaysAway(injections.nextAt, now.value, 2)) {
    earlyOpen.value = true
    return
  }
  injections.add(new Date())
}

function confirmEarly() {
  injections.add(new Date())
  earlyOpen.value = false
}

function confirmDelete() {
  if (!pendingDelete.value) return
  injections.remove(pendingDelete.value.id)
  pendingDelete.value = null
}

function openEdit(item: Injection) {
  const date = new Date(item.at)
  editing.value = item
  editDate.value = toDateInput(date)
  editTime.value = formatTime(date)
  editError.value = ''
}

function saveEdit() {
  if (!editing.value) return
  if (!isDateInput(editDate.value)) {
    editError.value = 'Укажите дату укола.'
    return
  }
  const clock = parseClock(editTime.value.slice(0, 5))
  if (!clock) {
    editError.value = 'Укажите время укола.'
    return
  }
  const at = parseDateOnly(editDate.value)
  at.setHours(clock.hours, clock.minutes, 0, 0)
  if (at.getTime() > now.value.getTime()) {
    editError.value = 'Дата и время не могут быть в будущем.'
    return
  }
  injections.update(editing.value.id, at)
  editing.value = null
}
</script>

<template>
  <div class="page page--nav stack">
    <header class="brand brand--mark">
      <img class="brand__mark" :src="markUrl" alt="" width="64" height="64" />
      <div>
        <h1>Дневник Тирзетты</h1>
        <p class="muted">
          Тирзепатид
          <template v-if="profile.doseMg != null">
            · <span class="dose-ink" :style="{ color: doseColor(profile.doseMg) }">{{ formatDose(profile.doseMg) }}</span>
          </template>
          · {{ scheduleWhen }}
        </p>
      </div>
    </header>

    <section v-if="injections.nextAt && !injections.last && hero" class="card hero" :class="{ 'hero--due': apart?.overdue }">
      <p class="hero__status">{{ apart?.overdue ? 'Пора сделать укол' : 'До следующего укола' }}</p>
      <div class="ring-wrap">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="52" class="ring__track" />
          <circle
            cx="60"
            cy="60"
            r="52"
            class="ring__value"
            :stroke="ringColor"
            :stroke-dasharray="ringOffset.length"
            :stroke-dashoffset="ringOffset.offset"
          />
        </svg>
        <div class="ring-copy">
          <p class="ring-copy__amount nums">{{ hero.amount }}</p>
          <p class="ring-copy__unit">{{ hero.unit }}</p>
          <p v-if="hero.secondary" class="ring-copy__secondary">{{ hero.secondary }}</p>
        </div>
      </div>
      <p class="hero__date">
        {{ apart?.overdue ? 'Срок был' : 'Следующий' }}
        · {{ formatDayMonth(injections.nextAt) }} · {{ formatTime(injections.nextAt) }}
      </p>
      <p v-if="apart?.overdue" class="hero__overdue">
        {{ apart.days === 0 && apart.hours === 0 && apart.minutes === 0 ? 'Срок только что наступил' : `Просрочено на ${formatDuration(apart)}` }}
      </p>
    </section>

    <section v-if="!injections.last" class="card empty-hero">
      <span class="empty-hero__icon"><Icon name="syringe" :size="28" /></span>
      <h2>Уколов пока нет</h2>
      <p class="muted">Отметьте первый укол или укажите, сколько уже сделано.</p>
      <button class="btn" type="button" @click="markNow">Укол сделан</button>
      <button class="btn btn--ghost" type="button" @click="openSeed">Уже были уколы</button>
    </section>

    <template v-else>
      <section class="card hero" :class="{ 'hero--due': apart?.overdue }">
        <p class="hero__status">{{ apart?.overdue ? 'Пора сделать укол' : 'До следующего укола' }}</p>
        <div class="ring-wrap">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="52" class="ring__track" />
            <circle
              cx="60"
              cy="60"
              r="52"
              class="ring__value"
              :stroke="ringColor"
              :stroke-dasharray="ringOffset.length"
              :stroke-dashoffset="ringOffset.offset"
            />
          </svg>
          <div v-if="hero" class="ring-copy">
            <p class="ring-copy__amount nums">{{ hero.amount }}</p>
            <p class="ring-copy__unit">{{ hero.unit }}</p>
            <p v-if="hero.secondary" class="ring-copy__secondary">{{ hero.secondary }}</p>
          </div>
        </div>
        <p v-if="injections.nextAt" class="hero__date">
          {{ apart?.overdue ? 'Срок был' : 'Следующий' }}
          · {{ formatDayMonth(injections.nextAt) }} · {{ formatTime(injections.nextAt) }}
        </p>
        <p v-if="apart?.overdue" class="hero__overdue">
          {{ apart.days === 0 && apart.hours === 0 && apart.minutes === 0 ? 'Срок только что наступил' : `Просрочено на ${formatDuration(apart)}` }}
        </p>
      </section>

      <div class="stats">
        <section class="card stat">
          <p class="muted">Сделано уколов</p>
          <p class="stat__value nums">{{ injections.count }}</p>
        </section>
        <section class="card stat">
          <p class="muted">Ушло веса</p>
          <p
            v-if="weightChange != null"
            class="stat__value nums"
            :class="{
              'delta--down': weightChange < 0,
              'delta--up': weightChange > 0,
            }"
          >
            {{ signedKg(weightChange) }}
          </p>
          <p v-else class="stat__value nums">—</p>
        </section>
        <section class="card stat">
          <p class="muted">Последний</p>
          <p class="stat__value stat__value--date">{{ formatDayMonth(new Date(injections.last.at)) }}</p>
        </section>
      </div>

      <button class="btn" type="button" @click="markNow">Укол сделан</button>

      <section class="card">
        <h2>Последние уколы</h2>
        <ul class="entries">
          <li v-for="item in injections.sorted" :key="item.id" class="entry">
            <div>
              <p class="entry__title">{{ formatDayMonth(new Date(item.at)) }}</p>
              <p class="muted">
                {{ formatTime(new Date(item.at)) }}
                <template v-if="item.mg != null">
                  · <span class="dose-ink" :style="{ color: doseColor(item.mg) }">{{ formatDose(item.mg) }}</span>
                </template>
              </p>
            </div>
            <div class="entry__actions">
              <button class="text-btn" type="button" @click="openEdit(item)">Изменить</button>
              <button class="text-btn" type="button" @click="pendingDelete = item">Удалить</button>
            </div>
          </li>
        </ul>
        <p class="fine">Всего {{ injections.count }} {{ plural(injections.count, 'укол', 'укола', 'уколов') }}</p>
      </section>
    </template>

    <BottomSheet :open="seedOpen" title="Уже были уколы" @close="seedOpen = false">
      <form class="stack" @submit.prevent="saveSeed">
        <p class="muted">От даты последнего укола отсчитаем предыдущие по неделям.</p>
        <label class="field">
          <span>Когда был последний укол?</span>
          <input v-model="seedDate" type="date" :max="toDateInput(now)" required />
        </label>
        <label class="field">
          <span>Сколько уже сделано</span>
          <input v-model="seedCount" inputmode="numeric" autocomplete="off" placeholder="6" />
        </label>
        <p v-if="seedError" class="error">{{ seedError }}</p>
        <button class="btn" type="submit">Сохранить</button>
      </form>
    </BottomSheet>

    <ConfirmDialog
      :open="earlyOpen"
      title="Отметить раньше?"
      :text="earlyText"
      confirm-label="Отметить"
      @close="earlyOpen = false"
      @confirm="confirmEarly"
    />

    <BottomSheet :open="editing != null" title="Дата укола" @close="editing = null">
      <form class="stack" @submit.prevent="saveEdit">
        <p class="muted">Самая поздняя отметка считается последним уколом.</p>
        <label class="field">
          <span>Дата</span>
          <input v-model="editDate" type="date" :max="toDateInput(now)" required />
        </label>
        <label class="field">
          <span>Время</span>
          <input v-model="editTime" type="time" step="60" required />
        </label>
        <p v-if="editError" class="error">{{ editError }}</p>
        <button class="btn" type="submit">Сохранить</button>
      </form>
    </BottomSheet>

    <ConfirmDialog
      :open="pendingDelete != null"
      title="Удалить укол?"
      :text="deleteText"
      confirm-label="Удалить"
      danger
      @close="pendingDelete = null"
      @confirm="confirmDelete"
    />
  </div>
</template>
