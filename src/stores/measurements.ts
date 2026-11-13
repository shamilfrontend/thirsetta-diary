import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { MeasureKind, Measurement } from '../types'
import { round1 } from '../utils/number'
import { compareEntries } from '../utils/weight'

const KINDS = new Set<MeasureKind>(['chest', 'waist', 'hips', 'thighs'])

export const useMeasurementsStore = defineStore('measurements', () => {
  const items = ref<Measurement[]>([])

  function sortedDesc(kind: MeasureKind): Measurement[] {
    return items.value.filter((item) => item.kind === kind).sort((a, b) => compareEntries(b, a))
  }

  function latestOf(kind: MeasureKind): Measurement | null {
    return sortedDesc(kind)[0] ?? null
  }

  function previousOf(kind: MeasureKind): Measurement | null {
    return sortedDesc(kind)[1] ?? null
  }

  function deltaOf(kind: MeasureKind): number | null {
    const current = latestOf(kind)
    const older = previousOf(kind)
    if (!current || !older) return null
    return round1(current.cm - older.cm)
  }

  function add(kind: MeasureKind, at: string, cm: number) {
    if (!KINDS.has(kind)) return
    items.value.push({
      id: crypto.randomUUID(),
      kind,
      at,
      cm: round1(cm),
      createdAt: new Date().toISOString(),
    })
  }

  function update(id: string, at: string, cm: number) {
    const entry = items.value.find((item) => item.id === id)
    if (!entry) return
    entry.at = at
    entry.cm = round1(cm)
  }

  function remove(id: string) {
    items.value = items.value.filter((item) => item.id !== id)
  }

  return { items, sortedDesc, latestOf, previousOf, deltaOf, add, update, remove }
})
