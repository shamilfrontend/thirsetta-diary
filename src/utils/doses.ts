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
