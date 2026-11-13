import type { Period, WeightEntry } from '../types'
import { parseDateOnly, shortMonth } from './dates'
import { round1 } from './number'

export type ChartPoint = {
  at: string
  kg: number
  label: string
}

type DatedValue = {
  at: string
  value: number
  createdAt: string
}

export function compareEntries(a: { at: string; createdAt: string }, b: { at: string; createdAt: string }): number {
  return a.at.localeCompare(b.at) || a.createdAt.localeCompare(b.createdAt)
}

export function goalProgress(startKg: number, goalKg: number, currentKg: number): number | null {
  const total = startKg - goalKg
  if (total <= 0) return null
  const ratio = (startKg - currentKg) / total
  return Math.round(Math.min(1, Math.max(0, ratio)) * 100)
}

export function deltaMessage(delta: number): string {
  const rounded = round1(delta)
  const amount = Math.abs(rounded).toFixed(1)
  if (rounded < 0) return `Отлично! Вы весите на ${amount} кг меньше, чем в прошлый раз.`
  if (rounded > 0) return `Вы весите на ${amount} кг больше, чем в прошлый раз.`
  return 'Вес не изменился с прошлого раза.'
}

export function chartBounds(values: number[]): { min: number; max: number; step: number } {
  let min = Math.min(...values)
  let max = Math.max(...values)
  if (min === max) {
    min -= 2
    max += 2
  } else {
    const pad = (max - min) * 0.12
    min -= pad
    max += pad
  }
  const step = niceStep(max - min)
  min = Math.floor(min / step) * step
  max = Math.ceil(max / step) * step
  if (max === min) max += step
  return { min, max, step }
}

function niceStep(span: number): number {
  const target = span / 4
  const steps = [1, 2, 5, 10, 20]
  return steps.find((step) => step >= target) ?? 20
}

export function buildSeries(entries: DatedValue[], period: Period): ChartPoint[] {
  const sorted = [...entries].sort(compareEntries)
  const groups = new Map<string, DatedValue>()
  for (const entry of sorted) groups.set(groupKey(entry.at, period), entry)
  const limit = period === 'day' ? 14 : 12
  const picked = [...groups.values()].slice(-limit)
  const dates = picked.map((entry) => parseDateOnly(entry.at))
  return picked.map((entry, index) => ({
    at: entry.at,
    kg: entry.value,
    label: pointLabel(dates[index]!, dates, period),
  }))
}

export function buildChart(entries: WeightEntry[], period: Period): ChartPoint[] {
  return buildSeries(
    entries.map((entry) => ({ at: entry.at, value: entry.kg, createdAt: entry.createdAt })),
    period,
  )
}

function groupKey(value: string, period: Period): string {
  if (period === 'month') return value.slice(0, 7)
  if (period === 'week') return isoWeekKey(value)
  return value
}

function isoWeekKey(value: string): string {
  const date = parseDateOnly(value)
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = utc.getUTCDay() || 7
  utc.setUTCDate(utc.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

function pointLabel(date: Date, all: Date[], period: Period): string {
  if (period === 'month') {
    const name = shortMonth(date)
    const duplicate = all.filter((item) => item.getMonth() === date.getMonth()).length > 1
    return duplicate ? `${name} ${String(date.getFullYear()).slice(2)}` : name
  }
  if (period === 'week') return `${date.getDate()}.${date.getMonth() + 1}`
  const days = all.map((item) => item.getDate())
  const unique = new Set(days).size === days.length
  return unique ? String(date.getDate()) : `${date.getDate()}.${date.getMonth() + 1}`
}
