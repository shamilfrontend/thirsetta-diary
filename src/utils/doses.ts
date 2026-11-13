import { parseInteger } from './number'
import { plural } from './plural'

export const DOSE_LEVELS = [2.5, 5, 7.5, 10, 12.5, 15] as const

export type DoseMg = (typeof DOSE_LEVELS)[number]

export const DOSE_COLORS: Record<DoseMg, string> = {
  2.5: '#e8453c',
  5: '#e4255a',
  7.5: '#e43786',
  10: '#ee5aa0',
  12.5: '#8d45c4',
  15: '#642d96',
}

export const DEFAULT_ACCENT = DOSE_COLORS[7.5]

export function isDoseMg(value: number): value is DoseMg {
  return (DOSE_LEVELS as readonly number[]).includes(value)
}

export function doseColor(mg: number | null | undefined): string {
  if (mg != null && isDoseMg(mg)) return DOSE_COLORS[mg]
  return DEFAULT_ACCENT
}

export function formatDose(mg: number): string {
  const text = Number.isInteger(mg) ? String(mg) : mg.toFixed(1).replace('.', ',')
  return `${text} мг`
}

export type EarlyDose = {
  mg: DoseMg
  count: number
}

export function pastDoseSeries(total: number, current: DoseMg | null, early: EarlyDose | null): Array<DoseMg | undefined> {
  const applied = current ?? undefined
  const doses: Array<DoseMg | undefined> = Array.from({ length: total }, () => applied)
  if (!early || early.count < 1 || early.count >= total) return doses
  for (let index = total - early.count; index < total; index += 1) doses[index] = early.mg
  return doses
}

export function pastDoseLine(total: number, current: DoseMg, early: EarlyDose): string {
  const rest = total - early.count
  const first = `${early.count} ${plural(early.count, 'укол', 'укола', 'уколов')}`
  const tail = rest === 1
    ? `последний — ${formatDose(current)}`
    : `остальные ${rest} ${plural(rest, 'укол', 'укола', 'уколов')} — ${formatDose(current)}`
  return `Первые ${first} — ${formatDose(early.mg)}, ${tail}.`
}

export function earlierDoseIssue(
  total: number,
  current: DoseMg | null,
  earlier: boolean,
  earlyMg: DoseMg | null,
  earlyCountRaw: string,
): { message: string; field: 'dose' | 'early' | 'early-count' } | null {
  if (!earlier || total < 2) return null
  if (current == null) return { field: 'dose', message: 'Укажите текущую дозу. На неё запишутся последние уколы.' }
  if (earlyMg == null) return { field: 'early', message: 'Укажите дозу первых уколов.' }
  if (earlyMg === current) return { field: 'early', message: 'Начальная доза совпадает с текущей.' }
  const count = parseInteger(earlyCountRaw)
  if (count == null || count < 1 || count >= total) {
    return { field: 'early-count', message: `Первых уколов — от 1 до ${total - 1}.` }
  }
  return null
}
