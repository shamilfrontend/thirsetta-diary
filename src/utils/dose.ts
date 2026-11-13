import { addDays, isDateInput, parseDateOnly, startOfDay, type TimeApart } from './dates'
import { plural } from './plural'

export const DOSE_INTERVAL_DAYS = 7

export function parseClock(value: string | null): { hours: number; minutes: number } | null {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return null
  const [hours, minutes] = value.split(':').map(Number)
  if (hours == null || minutes == null || hours > 23 || minutes > 59) return null
  return { hours, minutes }
}

export function courseWeek(start: string, now = new Date()): number | null {
  if (!isDateInput(start)) return null
  const days = Math.round((startOfDay(now).getTime() - startOfDay(parseDateOnly(start)).getTime()) / 86_400_000)
  if (days < 0) return null
  return Math.floor(days / 7) + 1
}

export function upcomingDose(
  last: Date | null,
  weekday: number | null,
  time: string | null = null,
  now = new Date(),
  courseStart: string | null = null,
): Date | null {
  const clock = parseClock(time)
  const hours = clock?.hours ?? last?.getHours() ?? 9
  const minutes = clock?.minutes ?? last?.getMinutes() ?? 0
  const started = courseStart && isDateInput(courseStart) ? parseDateOnly(courseStart) : null
  const atClock = (date: Date) => {
    const next = new Date(date)
    next.setHours(hours, minutes, 0, 0)
    return next
  }

  if (weekday == null) {
    if (last) {
      const next = addDays(last, DOSE_INTERVAL_DAYS)
      if (clock) next.setHours(hours, minutes, 0, 0)
      return next
    }
    if (!started) return null
    const first = atClock(started)
    return first.getTime() >= startOfDay(now).getTime() ? first : null
  }

  const today = startOfDay(now)
  const startDay = started ? startOfDay(started) : null
  const searchFrom = last
    ? addDays(startOfDay(last), 1)
    : startDay && startDay.getTime() > today.getTime()
      ? startDay
      : today
  const shift = (weekday - searchFrom.getDay() + 7) % 7
  return atClock(addDays(searchFrom, shift))
}

export function cycleRatio(last: Date | null, next: Date, now: Date): number {
  const start = last ?? addDays(next, -DOSE_INTERVAL_DAYS)
  const total = next.getTime() - start.getTime()
  if (total <= 0) return 1
  return Math.min(1, Math.max(0, (now.getTime() - start.getTime()) / total))
}

export function weeklySeries(last: Date, count: number): Date[] {
  const dates: Date[] = []
  for (let index = 0; index < count; index += 1) {
    dates.push(addDays(last, -DOSE_INTERVAL_DAYS * index))
  }
  return dates
}

export function formatDuration(part: TimeApart): string {
  const bits: string[] = []
  if (part.days > 0) bits.push(`${part.days} ${plural(part.days, 'день', 'дня', 'дней')}`)
  if (part.hours > 0) bits.push(`${part.hours} ${plural(part.hours, 'час', 'часа', 'часов')}`)
  if (bits.length > 0) return bits.join(' ')
  if (part.minutes > 0) return `${part.minutes} ${plural(part.minutes, 'минута', 'минуты', 'минут')}`
  return 'меньше часа'
}

export function heroNumbers(part: TimeApart): { amount: string; unit: string; secondary: string } {
  if (part.days === 0 && part.hours === 0 && part.minutes === 0) {
    return {
      amount: '0',
      unit: 'минут',
      secondary: part.overdue ? 'срок наступил' : 'до укола',
    }
  }

  if (part.days > 0) {
    let secondary = ''
    if (part.hours > 0) secondary = `${part.hours} ${plural(part.hours, 'час', 'часа', 'часов')}`
    else if (part.minutes > 0) secondary = `${part.minutes} ${plural(part.minutes, 'минута', 'минуты', 'минут')}`
    return {
      amount: String(part.days),
      unit: plural(part.days, 'день', 'дня', 'дней'),
      secondary,
    }
  }

  if (part.hours > 0) {
    return {
      amount: String(part.hours),
      unit: plural(part.hours, 'час', 'часа', 'часов'),
      secondary: part.minutes > 0
        ? `${part.minutes} ${plural(part.minutes, 'минута', 'минуты', 'минут')}`
        : part.overdue ? 'после срока' : 'до укола',
    }
  }

  return {
    amount: String(part.minutes),
    unit: plural(part.minutes, 'минута', 'минуты', 'минут'),
    secondary: part.overdue ? 'после срока' : 'до укола',
  }
}
