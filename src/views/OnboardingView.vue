<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '../components/Icon.vue'
import { guideSteps, type GuideStep } from '../content/guide'
import { useProfileStore } from '../stores/profile'
import { useWeightsStore } from '../stores/weights'
import type { Sex } from '../types'
import { toDateInput } from '../utils/dates'
import { parseDecimal, parseInteger, round1 } from '../utils/number'

type Step = GuideStep & { form?: 'weight' }

const steps: Step[] = [
  ...guideSteps,
  {
    icon: 'scale',
    title: 'О вас',
    lead: 'Пол и возраст остаются в профиле. Текущий вес записывается на сегодня и становится начальным, если его ещё не было.',
    facts: [],
    blocks: [],
    note: '',
    form: 'weight',
  },
]

const WEIGHT_MIN = 25
const WEIGHT_MAX = 350
const AGE_MIN = 18
const AGE_MAX = 100

const router = useRouter()
const profile = useProfileStore()
const weights = useWeightsStore()
const step = ref(0)
const heading = ref<HTMLHeadingElement | null>(null)
const scroller = ref<HTMLElement | null>(null)
const currentKg = ref(weights.latest ? weights.latest.kg.toFixed(1) : '')
const goalKg = ref(profile.goalKg == null ? '' : profile.goalKg.toFixed(1))
const sex = ref<Sex | null>(profile.sex)
const age = ref(profile.age == null ? '' : String(profile.age))
const formError = ref('')

const current = computed(() => steps[step.value] ?? steps[0]!)
const last = computed(() => step.value === steps.length - 1)

watch(step, async () => {
  formError.value = ''
  await nextTick()
  scroller.value?.scrollTo({ top: 0 })
  heading.value?.focus()
})

function back() {
  if (step.value > 0) step.value -= 1
}

function readWeight(raw: string, label: string): number | null {
  const parsed = parseDecimal(raw)
  if (parsed == null) {
    formError.value = `Введите ${label}, например 85.0`
    return null
  }
  const kg = round1(parsed)
  if (kg < WEIGHT_MIN || kg > WEIGHT_MAX) {
    formError.value = `${label[0]?.toUpperCase() ?? ''}${label.slice(1)} — от ${WEIGHT_MIN} до ${WEIGHT_MAX} кг.`
    return null
  }
  return kg
}

function saveProfile(): boolean {
  formError.value = ''
  if (sex.value == null) {
    formError.value = 'Укажите пол.'
    return false
  }
  const years = parseInteger(age.value)
  if (years == null) {
    formError.value = 'Введите возраст, например 34'
    return false
  }
  if (years < AGE_MIN || years > AGE_MAX) {
    formError.value = `Возраст — от ${AGE_MIN} до ${AGE_MAX} лет.`
    return false
  }
  const currentWeight = readWeight(currentKg.value, 'текущий вес')
  if (currentWeight == null) return false
  const goal = readWeight(goalKg.value, 'желаемый вес')
  if (goal == null) return false
  profile.setSex(sex.value)
  profile.setAge(years)
  profile.setGoal(goal)
  if (profile.startKg == null) profile.setStart(currentWeight)
  const today = toDateInput(new Date())
  const todayEntry = weights.items
    .filter((item) => item.at === today)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .at(-1)
  if (todayEntry) weights.update(todayEntry.id, today, currentWeight)
  else weights.add(today, currentWeight)
  return true
}

function next() {
  if (current.value.form === 'weight' && !saveProfile()) return
  if (!last.value) {
    step.value += 1
    return
  }
  profile.completeOnboarding()
  void router.replace({ name: 'home' })
}
</script>

<template>
  <div class="page onboard">
    <div ref="scroller" class="onboard__body">
      <header class="onboard__head">
        <div class="onboard__progress" aria-hidden="true">
          <span v-for="(_, index) in steps" :key="index" :class="{ 'is-on': index <= step }" />
        </div>
        <div class="onboard__top">
          <p class="onboard__kicker">Памятка</p>
          <p class="onboard__count nums">{{ step + 1 }} / {{ steps.length }}</p>
        </div>
      </header>
      <div v-if="current.layout === 'intro'" class="onboard__intro">
        <div class="onboard__mark onboard__mark--logo" aria-hidden="true">
          <img src="/favicon.svg" alt="" width="64" height="64" />
        </div>
        <div class="onboard__intro-copy">
          <h1 ref="heading" tabindex="-1">{{ current.title }}</h1>
          <p class="onboard__lead">{{ current.lead }}</p>
        </div>
        <ul class="onboard__sheet">
          <li v-for="fact in current.facts" :key="fact.label">
            <span class="onboard__fact-icon"><Icon :name="fact.icon" :size="18" /></span>
            <span class="onboard__fact-copy">
              <strong>{{ fact.label }}</strong>
              <span>{{ fact.caption }}</span>
            </span>
          </li>
        </ul>
      </div>
      <template v-else>
        <div class="onboard__mark" :class="{ 'onboard__mark--alert': current.tone === 'alert' }" aria-hidden="true">
          <Icon :name="current.icon" :size="30" />
        </div>
        <h1 ref="heading" tabindex="-1">{{ current.title }}</h1>
        <p class="onboard__lead">{{ current.lead }}</p>
      </template>
      <section
        v-for="block in current.blocks"
        :key="block.title"
        class="card"
        :class="{ 'onboard__card--alert': block.tone === 'alert' }"
      >
        <h2>{{ block.title }}</h2>
        <ul class="onboard__list">
          <li v-for="(item, index) in block.items" :key="item">
            <span class="onboard__index nums">{{ index + 1 }}</span>
            <span>{{ item }}</span>
          </li>
        </ul>
      </section>
      <p v-if="current.note" class="onboard__note">{{ current.note }}</p>
      <form v-if="current.form === 'weight'" class="onboard__form" @submit.prevent="next">
        <div class="field">
          <span id="onboard-sex">Пол</span>
          <div class="onboard__sex" role="radiogroup" aria-labelledby="onboard-sex">
            <button type="button" role="radio" :aria-checked="sex === 'female'" :class="{ active: sex === 'female' }" @click="sex = 'female'">
              Женский
            </button>
            <button type="button" role="radio" :aria-checked="sex === 'male'" :class="{ active: sex === 'male' }" @click="sex = 'male'">
              Мужской
            </button>
          </div>
        </div>
        <label class="field">
          <span>Возраст</span>
          <input v-model="age" inputmode="numeric" autocomplete="off" enterkeyhint="next" />
        </label>
        <label class="field">
          <span>Текущий вес, кг</span>
          <input v-model="currentKg" inputmode="decimal" autocomplete="off" enterkeyhint="next" />
        </label>
        <label class="field">
          <span>Желаемый вес, кг</span>
          <input v-model="goalKg" inputmode="decimal" autocomplete="off" enterkeyhint="done" />
        </label>
        <p v-if="formError" class="error">{{ formError }}</p>
      </form>
    </div>

    <footer class="onboard__foot">
      <p class="fine">Решение о терапии и наборе анализов принимает врач.</p>
      <div class="onboard__actions" :class="{ 'onboard__actions--single': step === 0 }">
        <button v-if="step > 0" class="btn btn--ghost" type="button" @click="back">Назад</button>
        <button class="btn" type="button" @click="next">
          {{ last ? 'Понятно, к дневнику' : 'Дальше' }}
        </button>
      </div>
    </footer>
  </div>
</template>
