export type Injection = {
  id: string
  at: string
  mg?: number
}

export type WeightEntry = {
  id: string
  at: string
  kg: number
  createdAt: string
}

export type MeasureKind = 'chest' | 'waist' | 'hips' | 'thighs'

export type Measurement = {
  id: string
  kind: MeasureKind
  at: string
  cm: number
  createdAt: string
}

export type UnitSystem = 'metric' | 'imperial'

export type Sex = 'female' | 'male'

export type Period = 'day' | 'week' | 'month'
