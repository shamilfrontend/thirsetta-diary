import type { MeasureKind, Measurement, Period } from '../types'
import { round1 } from './number'
import { buildSeries, type ChartPoint } from './weight'

export const MEASURES: { id: MeasureKind; label: string; tone: string }[] = [
  { id: 'chest', label: 'Обхват груди', tone: 'chest' },
  { id: 'waist', label: 'Обхват талии', tone: 'waist' },
  { id: 'hips', label: 'Обхват бедер', tone: 'hips' },
  { id: 'thighs', label: 'Обхват ляжек', tone: 'thighs' },
]

export function measureLabel(kind: MeasureKind): string {
  return MEASURES.find((item) => item.id === kind)?.label ?? kind
}

export function measureDeltaMessage(delta: number): string {
  const rounded = round1(delta)
  const amount = Math.abs(rounded).toFixed(1)
  if (rounded < 0) return `На ${amount} см меньше, чем в прошлый раз.`
  if (rounded > 0) return `На ${amount} см больше, чем в прошлый раз.`
  return 'Обхват не изменился с прошлого раза.'
}

export function buildMeasureChart(entries: Measurement[], period: Period): ChartPoint[] {
  return buildSeries(
    entries.map((entry) => ({ at: entry.at, value: entry.cm, createdAt: entry.createdAt })),
    period,
  )
}
