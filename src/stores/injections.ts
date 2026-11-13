import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Injection } from '../types'
import { dateTimeOn } from '../utils/dates'
import { upcomingDose, weeklySeries } from '../utils/dose'
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

  function currentDose(): number | undefined {
    const mg = useProfileStore().doseMg
    return mg == null ? undefined : mg
  }

  function add(at: Date) {
    items.value.push({ id: crypto.randomUUID(), at: at.toISOString(), mg: currentDose() })
  }

  function update(id: string, at: Date) {
    const entry = items.value.find((item) => item.id === id)
    if (!entry) return
    entry.at = at.toISOString()
  }

  function remove(id: string) {
    items.value = items.value.filter((item) => item.id !== id)
  }

  function seed(lastDate: string, total: number, now = new Date()) {
    const lastAt = dateTimeOn(lastDate, now)
    const mg = currentDose()
    items.value = weeklySeries(lastAt, total).map((date) => ({
      id: crypto.randomUUID(),
      at: date.toISOString(),
      mg,
    }))
  }

  return { items, sorted, count, last, nextAt, add, update, remove, seed }
})
