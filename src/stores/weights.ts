import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { WeightEntry } from '../types'
import { round1 } from '../utils/number'
import { compareEntries } from '../utils/weight'

export const useWeightsStore = defineStore('weights', () => {
  const items = ref<WeightEntry[]>([])

  const sortedAsc = computed(() => [...items.value].sort(compareEntries))
  const sortedDesc = computed(() => [...sortedAsc.value].reverse())
  const latest = computed(() => sortedDesc.value[0] ?? null)
  const previous = computed(() => sortedDesc.value[1] ?? null)
  const delta = computed(() => {
    if (!latest.value || !previous.value) return null
    return round1(latest.value.kg - previous.value.kg)
  })

  function add(at: string, kg: number) {
    items.value.push({
      id: crypto.randomUUID(),
      at,
      kg: round1(kg),
      createdAt: new Date().toISOString(),
    })
  }

  function update(id: string, at: string, kg: number) {
    const entry = items.value.find((item) => item.id === id)
    if (!entry) return
    entry.at = at
    entry.kg = round1(kg)
  }

  function remove(id: string) {
    items.value = items.value.filter((item) => item.id !== id)
  }

  return { items, sortedAsc, sortedDesc, latest, previous, delta, add, update, remove }
})
