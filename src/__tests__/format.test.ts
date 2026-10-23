import { describe, it, expect } from 'vitest'
import { formatDate, formatTime, formatMinutes } from '@/lib/format'

describe('formatDate', () => {
  it('formats a date string to short locale format', () => {
    const result = formatDate('2025-01-15')
    expect(result).toMatch(/Jan/)
    expect(result).toMatch(/15/)
  })

  it('includes weekday abbreviation', () => {
    const result = formatDate('2025-01-13') // Monday
    expect(result).toMatch(/Mon/)
  })
})

describe('formatTime', () => {
  it('formats a timestamp to 12-hour time', () => {
    const result = formatTime('2025-01-15T18:30:00+08:00')
    expect(result).toMatch(/6:30/)
    expect(result.toLowerCase()).toMatch(/pm/)
  })

  it('handles midnight correctly', () => {
    const result = formatTime('2025-01-15T00:00:00+08:00')
    expect(result).toMatch(/12:00/)
  })
})

describe('formatMinutes', () => {
  it('converts milliseconds to whole minutes', () => {
    expect(formatMinutes(60000)).toBe(1)
    expect(formatMinutes(90000)).toBe(1)
    expect(formatMinutes(120000)).toBe(2)
  })

  it('returns 0 for less than a minute', () => {
    expect(formatMinutes(30000)).toBe(0)
  })
})
