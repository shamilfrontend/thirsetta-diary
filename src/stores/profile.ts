import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Sex, UnitSystem } from '../types'
import { isDateInput, parseDateOnly } from '../utils/dates'
import { isDoseMg, type DoseMg } from '../utils/doses'
import { round1 } from '../utils/number'

export const useProfileStore = defineStore('profile', () => {
  const heightCm = ref<number | null>(null)
  const goalKg = ref<number | null>(null)
  const startKg = ref<number | null>(null)
  const unit = ref<UnitSystem>('metric')
  const doseWeekday = ref<number | null>(null)
  const doseTime = ref<string | null>(null)
  const courseStart = ref<string | null>(null)
  const doseMg = ref<DoseMg | null>(null)
  const sex = ref<Sex | null>(null)
  const age = ref<number | null>(null)
  const onboardingDone = ref(false)

  function setHeight(cm: number) {
    heightCm.value = round1(cm)
  }

  function setGoal(kg: number) {
    goalKg.value = round1(kg)
  }

  function setStart(kg: number) {
    startKg.value = round1(kg)
  }

  function setUnit(next: UnitSystem) {
    unit.value = next
  }

  function setDoseWeekday(day: number) {
    if (day < 0 || day > 6) return
    doseWeekday.value = day
  }

  function setDoseTime(value: string | null) {
    if (value == null || value === '') {
      doseTime.value = null
      return
    }
    const match = /^(\d{2}):(\d{2})$/.exec(value)
    if (!match) return
    const hours = Number(match[1])
    const minutes = Number(match[2])
    if (hours > 23 || minutes > 59) return
    doseTime.value = `${match[1]}:${match[2]}`
  }

  function setCourseStart(value: string | null) {
    if (value == null || value === '') {
      courseStart.value = null
      return
    }
    if (!isDateInput(value)) return
    courseStart.value = value
    if (doseWeekday.value == null) doseWeekday.value = parseDateOnly(value).getDay()
  }

  function setDose(mg: number) {
    if (!isDoseMg(mg)) return
    doseMg.value = mg
  }

  function setSex(value: Sex) {
    sex.value = value
  }

  function setAge(years: number) {
    if (!Number.isInteger(years) || years < 18 || years > 100) return
    age.value = years
  }

  function completeOnboarding() {
    onboardingDone.value = true
  }

  return {
    heightCm,
    goalKg,
    startKg,
    unit,
    doseWeekday,
    doseTime,
    courseStart,
    doseMg,
    sex,
    age,
    onboardingDone,
    setHeight,
    setGoal,
    setStart,
    setUnit,
    setDoseWeekday,
    setDoseTime,
    setCourseStart,
    setDose,
    setSex,
    setAge,
    completeOnboarding,
  }
})
