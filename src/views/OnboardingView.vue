<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '../components/Icon.vue'
import PastDoseFields from '../components/PastDoseFields.vue'
import { guideSteps, type GuideStep } from '../content/guide'
import { useInjectionsStore } from '../stores/injections'
import { useProfileStore } from '../stores/profile'
import { useWeightsStore } from '../stores/weights'
import type { Sex } from '../types'
import { isAfterToday, isDateInput, toDateInput } from '../utils/dates'
import { earlierDoseIssue, type DoseMg } from '../utils/doses'
import { parseDecimal, parseInteger, round1 } from '../utils/number'

const markUrl = `${import.meta.env.BASE_URL}favicon.svg`

type Step = GuideStep & { form?: 'weight' | 'history' }

const steps: Step[] = [
  ...guideSteps,
  {
    icon: 'scale',
    title: 'О вас',
    lead: 'Пол, возраст и рост остаются в профиле. Текущий вес записывается на сегодня и становится начальным, если его ещё не было.',
    facts: [],
    blocks: [],
    note: '',
    form: 'weight',
  },
  {
    icon: 'calendar',
    title: 'Уже были уколы',
    lead: 'Если процедуры уже идут, запишем прошлые даты. Дальше в дневнике отмечаются только новые уколы.',
    facts: [],
    blocks: [],
    note: '',
    form: 'history',
  },
]

const WEIGHT_MIN = 25
const WEIGHT_MAX = 350
const HEIGHT_MIN = 80
const HEIGHT_MAX = 250
const AGE_MIN = 18
const AGE_MAX = 100

const router = useRouter()
const profile = useProfileStore()
const injections = useInjectionsStore()
const weights = useWeightsStore()
const step = ref(0)
const heading = ref<HTMLHeadingElement | null>(null)
const scroller = ref<HTMLElement | null>(null)
const currentKg = ref(weights.latest ? weights.latest.kg.toFixed(1) : '')
const goalKg = ref(profile.goalKg == null ? '' : profile.goalKg.toFixed(1))
const heightCm = ref(profile.heightCm == null ? '' : profile.heightCm.toFixed(1))
const sex = ref<Sex | null>(profile.sex)
const age = ref(profile.age == null ? '' : String(profile.age))
const formError = ref('')
type ProfileField = 'sex' | 'age' | 'height' | 'weight' | 'goal' | 'prior' | 'date' | 'count' | 'dose' | 'early' | 'early-count'
const invalidField = ref<ProfileField | ''>('')
const prior = ref<'none' | 'some' | null>(null)
const seedDate = ref(toDateInput(new Date()))
const seedCount = ref('')
const seedDose = ref<DoseMg | null>(profile.doseMg)
const seedEarlier = ref(false)
const seedEarlyDose = ref<DoseMg | null>(null)
const seedEarlyCount = ref('')

const current = computed(() => steps[step.value] ?? steps[0]!)
const last = computed(() => step.value === steps.length - 1)

watch(step, async () => {
  formError.value = ''
  invalidField.value = ''
  await nextTick()
  scroller.value?.scrollTo({ top: 0 })
  heading.value?.focus()
})

function back() {
  if (step.value > 0) step.value -= 1
}

function choosePrior(value: 'none' | 'some') {
  prior.value = value
  if (invalidField.value === 'prior') {
    invalidField.value = ''
    formError.value = ''
  }
}

function reject(field: ProfileField, message: string) {
  formError.value = message
  invalidField.value = field
  void nextTick(() => {
    document.getElementById(`onboard-${field}`)?.scrollIntoView({ block: 'nearest' })
  })
}

function readHeight(): number | null {
  const parsed = parseDecimal(heightCm.value)
  if (parsed == null) {
    reject('height', 'Введите рост, например 176.0')
    return null
  }
  const cm = round1(parsed)
  if (cm < HEIGHT_MIN || cm > HEIGHT_MAX) {
    reject('height', `Рост — от ${HEIGHT_MIN} до ${HEIGHT_MAX} см.`)
    return null
  }
  return cm
}

function readWeight(raw: string, label: string, field: 'weight' | 'goal'): number | null {
  const parsed = parseDecimal(raw)
  if (parsed == null) {
    reject(field, `Введите ${label}, например 85.0`)
    return null
  }
  const kg = round1(parsed)
  if (kg < WEIGHT_MIN || kg > WEIGHT_MAX) {
    reject(field, `${label[0]?.toUpperCase() ?? ''}${label.slice(1)} — от ${WEIGHT_MIN} до ${WEIGHT_MAX} кг.`)
    return null
  }
  return kg
}

function saveProfile(): boolean {
  formError.value = ''
  invalidField.value = ''
  if (sex.value == null) {
    reject('sex', 'Укажите пол.')
    return false
  }
  const years = parseInteger(age.value)
  if (years == null) {
    reject('age', 'Введите возраст, например 34')
    return false
  }
  if (years < AGE_MIN || years > AGE_MAX) {
    reject('age', `Возраст — от ${AGE_MIN} до ${AGE_MAX} лет.`)
    return false
  }
  const height = readHeight()
  if (height == null) return false
  const currentWeight = readWeight(currentKg.value, 'текущий вес', 'weight')
  if (currentWeight == null) return false
  const goal = readWeight(goalKg.value, 'желаемый вес', 'goal')
  if (goal == null) return false
  profile.setSex(sex.value)
  profile.setAge(years)
  profile.setHeight(height)
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

function saveHistory(): boolean {
  formError.value = ''
  invalidField.value = ''
  if (prior.value == null) {
    reject('prior', 'Укажите, были ли уже уколы.')
    return false
  }
  if (prior.value === 'none') return true
  const now = new Date()
  if (!isDateInput(seedDate.value)) {
    reject('date', 'Укажите дату последнего укола.')
    return false
  }
  if (isAfterToday(seedDate.value, now)) {
    reject('date', 'Дата укола не может быть в будущем.')
    return false
  }
  const count = parseInteger(seedCount.value)
  if (count == null || count < 1 || count > 200) {
    reject('count', 'Укажите, сколько уколов уже сделано: от 1 до 200.')
    return false
  }
  const issue = earlierDoseIssue(count, seedDose.value, seedEarlier.value, seedEarlyDose.value, seedEarlyCount.value)
  if (issue) {
    reject(issue.field, issue.message)
    return false
  }
  const first = parseInteger(seedEarlyCount.value)
  const early = seedEarlier.value && count > 1 && seedEarlyDose.value != null && first != null
    ? { mg: seedEarlyDose.value, count: first }
    : null
  injections.recordPast(seedDate.value, count, seedDose.value, now, early)
  return true
}

function next() {
  if (current.value.form === 'weight' && !saveProfile()) return
  if (current.value.form === 'history' && !saveHistory()) return
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
        <img class="onboard__logo" :src="markUrl" alt="" width="112" height="112" />
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
        <div id="onboard-sex" class="field">
          <span id="onboard-sex-label">Пол</span>
          <div class="onboard__sex" :class="{ 'is-invalid': invalidField === 'sex' }" role="radiogroup" aria-labelledby="onboard-sex-label">
            <button type="button" role="radio" :aria-checked="sex === 'female'" :aria-invalid="invalidField === 'sex'" :class="{ active: sex === 'female' }" @click="sex = 'female'">
              Женский
            </button>
            <button type="button" role="radio" :aria-checked="sex === 'male'" :aria-invalid="invalidField === 'sex'" :class="{ active: sex === 'male' }" @click="sex = 'male'">
              Мужской
            </button>
          </div>
        </div>
        <label id="onboard-age" class="field">
          <span>Возраст</span>
          <input v-model="age" :class="{ 'is-invalid': invalidField === 'age' }" :aria-invalid="invalidField === 'age'" inputmode="numeric" autocomplete="off" enterkeyhint="next" />
        </label>
        <label id="onboard-height" class="field">
          <span>Рост, см</span>
          <input v-model="heightCm" :class="{ 'is-invalid': invalidField === 'height' }" :aria-invalid="invalidField === 'height'" inputmode="decimal" autocomplete="off" enterkeyhint="next" />
        </label>
        <label id="onboard-weight" class="field">
          <span>Текущий вес, кг</span>
          <input v-model="currentKg" :class="{ 'is-invalid': invalidField === 'weight' }" :aria-invalid="invalidField === 'weight'" inputmode="decimal" autocomplete="off" enterkeyhint="next" />
        </label>
        <label id="onboard-goal" class="field">
          <span>Желаемый вес, кг</span>
          <input v-model="goalKg" :class="{ 'is-invalid': invalidField === 'goal' }" :aria-invalid="invalidField === 'goal'" inputmode="decimal" autocomplete="off" enterkeyhint="done" />
        </label>
      </form>
      <form v-else-if="current.form === 'history'" class="onboard__form" @submit.prevent="next">
        <div id="onboard-prior" class="field">
          <span id="onboard-prior-label">Процедуры уже идут?</span>
          <div class="onboard__sex" :class="{ 'is-invalid': invalidField === 'prior' }" role="radiogroup" aria-labelledby="onboard-prior-label">
            <button type="button" role="radio" :aria-checked="prior === 'none'" :aria-invalid="invalidField === 'prior'" :class="{ active: prior === 'none' }" @click="choosePrior('none')">
              Ещё не начинал
            </button>
            <button type="button" role="radio" :aria-checked="prior === 'some'" :aria-invalid="invalidField === 'prior'" :class="{ active: prior === 'some' }" @click="choosePrior('some')">
              Уже делаю
            </button>
          </div>
        </div>
        <template v-if="prior === 'some'">
          <label id="onboard-date" class="field">
            <span>Когда был последний укол?</span>
            <input v-model="seedDate" :class="{ 'is-invalid': invalidField === 'date' }" :aria-invalid="invalidField === 'date'" type="date" :max="toDateInput(new Date())" required />
          </label>
          <label id="onboard-count" class="field">
            <span>Сколько уже сделано</span>
            <input v-model="seedCount" :class="{ 'is-invalid': invalidField === 'count' }" :aria-invalid="invalidField === 'count'" inputmode="numeric" autocomplete="off" placeholder="6" />
          </label>
          <PastDoseFields
            id-prefix="onboard"
            v-model:dose="seedDose"
            v-model:earlier="seedEarlier"
            v-model:early-dose="seedEarlyDose"
            v-model:early-count="seedEarlyCount"
            :total-raw="seedCount"
            :invalid="invalidField"
          />
        </template>
      </form>
    </div>

    <footer class="onboard__foot">
      <p class="fine">Решение о терапии и наборе анализов принимает врач.</p>
      <p v-if="formError" class="error" role="alert">{{ formError }}</p>
      <div class="onboard__actions" :class="{ 'onboard__actions--single': step === 0 }">
        <button v-if="step > 0" class="btn btn--ghost" type="button" @click="back">Назад</button>
        <button class="btn" type="button" @click="next">
          {{ last ? 'Понятно, к дневнику' : 'Дальше' }}
        </button>
      </div>
    </footer>
  </div>
</template>
