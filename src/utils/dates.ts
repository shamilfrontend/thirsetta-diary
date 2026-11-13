const WEEKDAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']

export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const

export const WEEKDAY_NAMES = [
  'воскресенье',
  'понедельник',
  'вторник',
  'среда',
  'четверг',
  'пятница',
  'суббота',
]

export const WEEKDAY_SCHEDULE = [
  'по воскресеньям',
  'по понедельникам',
  'по вторникам',
  'по средам',
  'по четвергам',
  'по пятницам',
  'по субботам',
]

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}
const MONTHS = ['янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июн.', 'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.']
const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

export function toDateInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1)
}

export function isDateInput(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  return toDateInput(parseDateOnly(value)) === value
}

export function isAfterToday(value: string, now = new Date()): boolean {
  return value > toDateInput(now)
}

export function dateTimeOn(dateInput: string, now = new Date()): Date {
  const date = parseDateOnly(dateInput)
  if (dateInput === toDateInput(now)) {
    date.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), 0)
    return date
  }
  date.setHours(9, 0, 0, 0)
  return date
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime())
  next.setDate(next.getDate() + days)
  return next
}

export function formatDayMonth(date: Date): string {
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`
}

export function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function shortMonth(date: Date): string {
  return MONTHS_SHORT[date.getMonth()] ?? ''
}

export type TimeApart = {
  overdue: boolean
  days: number
  hours: number
  minutes: number
}

export function timeApart(target: Date, now: Date): TimeApart {
  const diff = target.getTime() - now.getTime()
  const overdue = diff <= 0
  let rest = Math.abs(diff)
  const days = Math.floor(rest / 86_400_000)
  rest -= days * 86_400_000
  const hours = Math.floor(rest / 3_600_000)
  rest -= hours * 3_600_000
  const minutes = Math.floor(rest / 60_000)
  return { overdue, days, hours, minutes }
}

export function isMoreThanDaysAway(target: Date, now: Date, days: number): boolean {
  return target.getTime() - now.getTime() > days * 86_400_000
}
