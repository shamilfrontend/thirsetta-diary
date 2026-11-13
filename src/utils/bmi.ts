export const BMI_MIN = 15
export const BMI_MAX = 40

export const BMI_TICKS = [15, 18.5, 25, 30, 35, 40]

export const BMI_SEGMENTS = [
  { from: 15, to: 16, color: '#4c6fff' },
  { from: 16, to: 18.5, color: '#3cb4ff' },
  { from: 18.5, to: 25, color: '#3dcc7a' },
  { from: 25, to: 30, color: '#f0d34a' },
  { from: 30, to: 35, color: '#f5a142' },
  { from: 35, to: 40, color: '#e15b4c' },
] as const

export function bmiValue(weightKg: number, heightCm: number): number | null {
  if (heightCm <= 0) return null
  const meters = heightCm / 100
  return weightKg / (meters * meters)
}

export function bmiLabel(value: number): string {
  if (value < 16) return 'Выраженный дефицит массы'
  if (value < 18.5) return 'Недостаточная масса тела'
  if (value < 25) return 'Норма'
  if (value < 30) return 'Избыточная масса тела'
  if (value < 35) return 'Ожирение первой степени'
  if (value < 40) return 'Ожирение второй степени'
  return 'Ожирение третьей степени'
}

export function bmiColor(value: number): string {
  if (value < BMI_MIN) return BMI_SEGMENTS[0].color
  const segment = BMI_SEGMENTS.find((item) => value < item.to)
  return segment?.color ?? BMI_SEGMENTS[BMI_SEGMENTS.length - 1]!.color
}

export function scalePercent(value: number, min = BMI_MIN, max = BMI_MAX): number {
  const clamped = Math.min(max, Math.max(min, value))
  return ((clamped - min) / (max - min)) * 100
}
