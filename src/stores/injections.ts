import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Injection } from '../types'
import { dateTimeOn, toDateInput } from '../utils/dates'
import { upcomingDose, weeklySeries } from '../utils/dose'
import { pastDoseSeries, type DoseMg, type EarlyDose } from '../utils/doses'
import { useProfileStore } from './profile'

export const useInjectionsStore = defineStore('injections', () => {
  const items = ref<Injection[]>([])

  const sorted = computed(() => [...items.value].sort((a, b) => b.at.localeCompare(a.at)))
  const count = computed(() => items.value.length)
  const last = computed(() => sorted.value[0] ?? null)
  const nextAt = computed(() => {
    const profile = useProfileStore()
    const lastDate = last.value ? new Date(last.value.at) : null
    return upcomingDose(lastDate, profile.doseWeekday, profile.doseTime, new Date(), profile.courseStart)
  })

  function currentDose(): DoseMg | undefined {
    const mg = useProfileStore().doseMg
    return mg == null ? undefined : mg
  }

  function add(at: Date) {
    items.value.push({ id: crypto.randomUUID(), at: at.toISOString(), mg: currentDose() })
  }

  function update(id: string, at: Date, mg: DoseMg | null) {
    const entry = items.value.find((item) => item.id === id)
    if (!entry) return
    entry.at = at.toISOString()
    if (mg == null) delete entry.mg
    else entry.mg = mg
  }

  function remove(id: string) {
    items.value = items.value.filter((item) => item.id !== id)
  }

  function seed(lastDate: string, doses: Array<DoseMg | undefined>, now = new Date()) {
    const lastAt = dateTimeOn(lastDate, now)
    const dates = weeklySeries(lastAt, doses.length).map((date, index) => {
      if (index === 0) return date
      const atNine = new Date(date)
      atNine.setHours(9, 0, 0, 0)
      return atNine
    })
    items.value = dates.map((date, index) => ({
      id: crypto.randomUUID(),
      at: date.toISOString(),
      mg: doses[index],
    }))
    const first = dates.at(-1) ?? lastAt
    return toDateInput(first)
  }

  function recordPast(lastDate: string, total: number, dose: DoseMg | null, now = new Date(), early: EarlyDose | null = null) {
    const profile = useProfileStore()
    if (dose != null) profile.setDose(dose)
    const applied = dose ?? currentDose() ?? null
    const first = seed(lastDate, pastDoseSeries(total, applied, early), now)
    profile.setCourseStart(first)
  }

  return { items, sorted, count, last, nextAt, add, update, remove, seed, recordPast }
})
