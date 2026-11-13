export function round1(value: number): number {
  return Math.round(value * 10) / 10
}

export function parseDecimal(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.')
  if (!/^\d+(\.\d*)?$/.test(normalized)) return null
  const value = Number(normalized)
  return Number.isFinite(value) ? value : null
}

export function parseInteger(raw: string): number | null {
  if (!/^\d+$/.test(raw.trim())) return null
  const value = Number(raw.trim())
  return Number.isSafeInteger(value) ? value : null
}

export function signedKg(delta: number): string {
  const rounded = round1(delta)
  const value = Math.abs(rounded).toFixed(1)
  if (rounded < 0) return `−${value} кг`
  if (rounded > 0) return `+${value} кг`
  return `${value} кг`
}

export function signedCm(delta: number): string {
  const rounded = round1(delta)
  const value = Math.abs(rounded).toFixed(1)
  if (rounded < 0) return `−${value} см`
  if (rounded > 0) return `+${value} см`
  return `${value} см`
}
