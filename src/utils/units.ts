import { round1 } from './number'

const LB_PER_KG = 2.2046226218
const CM_PER_INCH = 2.54

export function kgToLb(kg: number): number {
  return kg * LB_PER_KG
}

export function lbToKg(lb: number): number {
  return lb / LB_PER_KG
}

export function cmToFtIn(cm: number): { ft: number; inches: number } {
  const totalInches = cm / CM_PER_INCH
  let ft = Math.floor(totalInches / 12)
  let inches = Math.round(totalInches - ft * 12)
  if (inches === 12) {
    ft += 1
    inches = 0
  }
  return { ft, inches }
}

export function ftInToCm(ft: number, inches: number): number {
  return (ft * 12 + inches) * CM_PER_INCH
}

export function formatHeight(cm: number, imperial: boolean): string {
  if (!imperial) return `${round1(cm).toFixed(1)} cm`
  const { ft, inches } = cmToFtIn(cm)
  return `${ft} ft ${inches} in`
}

export function formatWeight(kg: number, imperial: boolean): string {
  if (!imperial) return `${round1(kg).toFixed(1)} kg`
  return `${kgToLb(kg).toFixed(1)} lb`
}
