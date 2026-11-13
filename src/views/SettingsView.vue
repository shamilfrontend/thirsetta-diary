<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import Icon from '../components/Icon.vue'
import { useInjectionsStore } from '../stores/injections'
import { useProfileStore } from '../stores/profile'
import { formatDayMonth, formatTime, isAfterToday, isDateInput, parseDateOnly, WEEKDAY_NAMES, WEEKDAY_ORDER, WEEKDAY_SCHEDULE } from '../utils/dates'
import { courseWeek } from '../utils/dose'
import { DOSE_LEVELS, doseColor, formatDose } from '../utils/doses'

const profile = useProfileStore()
const injections = useInjectionsStore()

const shortDays = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']

const schedule = computed(() => {
  if (profile.doseWeekday == null) return ''
  const day = WEEKDAY_SCHEDULE[profile.doseWeekday] ?? ''
  return profile.doseTime ? `${day} в ${profile.doseTime}` : day
})

const timeValue = computed(() => {
  if (profile.doseTime) return profile.doseTime
  if (injections.last) return formatTime(new Date(injections.last.at))
  return '09:00'
})

const nextLabel = computed(() => {
  if (!injections.nextAt) return ''
  return `${formatDayMonth(injections.nextAt)} · ${formatTime(injections.nextAt)}`
})

function sentence(text: string): string {
  return text.endsWith('.') ? text : `${text}.`
}

const courseLine = computed(() => {
  const value = profile.courseStart
  if (!value || !isDateInput(value)) return ''
  const formatted = formatDayMonth(parseDateOnly(value))
  if (isAfterToday(value)) return sentence(`Процедуры с ${formatted}`)
  const week = courseWeek(value)
  const course = week == null ? `Процедуры с ${formatted}` : `Процедуры с ${formatted}, ${week}-я неделя`
  return sentence(course)
})

const scheduleNote = computed(() => [courseLine.value, schedule.value ? `Следующие уколы ${schedule.value}.` : ''].filter(Boolean).join(' '))

function onTime(event: Event) {
  profile.setDoseTime((event.target as HTMLInputElement).value)
}

function onStart(event: Event) {
  profile.setCourseStart((event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="page page--nav stack">
    <header class="brand">
      <h1>Настройки</h1>
      <p class="muted">Расписание и доза укола Тирзетты</p>
    </header>

    <section class="card">
      <h2>День укола</h2>
      <p class="muted block">Раз в неделю, в один и тот же день и час.</p>
      <div class="day-list" role="radiogroup" aria-label="День недели для укола">
        <button
          v-for="day in WEEKDAY_ORDER"
          :key="day"
          type="button"
          role="radio"
          :aria-label="WEEKDAY_NAMES[day]"
          :aria-checked="profile.doseWeekday === day"
          :class="{ active: profile.doseWeekday === day }"
          @click="profile.setDoseWeekday(day)"
        >
          {{ shortDays[day] }}
        </button>
      </div>
      <label class="field dose-time">
        <span>Время</span>
        <input type="time" step="60" :value="timeValue" aria-label="Время укола" @change="onTime" />
      </label>
      <label class="field dose-start">
        <span>Начало процедур</span>
        <input
          type="date"
          :value="profile.courseStart ?? ''"
          aria-label="Дата начала процедур"
          @change="onStart"
        />
      </label>
      <p v-if="scheduleNote" class="muted block">{{ scheduleNote }}</p>
      <p v-if="nextLabel" class="fine">Ближайший: {{ nextLabel }}</p>
    </section>

    <section class="card">
      <h2>Доза</h2>
      <p class="muted block">Уровень, который вводите сейчас. Новые уколы записываются с этой дозой.</p>
      <div class="dose-list" role="radiogroup" aria-label="Доза Тирзетты">
        <button
          v-for="mg in DOSE_LEVELS"
          :key="mg"
          type="button"
          role="radio"
          :aria-checked="profile.doseMg === mg"
          :class="{ active: profile.doseMg === mg }"
          :style="{ '--dose': doseColor(mg) }"
          @click="profile.setDose(mg)"
        >
          {{ formatDose(mg) }}
        </button>
      </div>
      <p v-if="profile.doseMg != null" class="muted block">
        Сейчас <span class="dose-ink" :style="{ color: doseColor(profile.doseMg) }">{{ formatDose(profile.doseMg) }}</span>.
      </p>
    </section>

    <RouterLink class="card memo-link" to="/onboarding">
      <span>
        <strong>Памятка перед стартом</strong>
        <span class="muted">Врач, анализы и на что смотреть в курсе</span>
      </span>
      <Icon name="chevron" :size="20" />
    </RouterLink>
  </div>
</template>
