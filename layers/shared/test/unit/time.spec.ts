import { describe, it, expect } from 'vitest'
import { destructureDate, getMonth, getDate, getDay, subtractDates, monthsAbbr } from '../../app/utils/time'

// 2024-03-15 is a Friday.
const SAMPLE_DATE = '2024-03-15T10:30:45.000Z'

describe('destructureDate', () => {
  it('breaks a date string into its components', () => {
    const d = new Date(SAMPLE_DATE)
    expect(destructureDate(SAMPLE_DATE)).toEqual({
      year: d.getFullYear(),
      month: d.getMonth(),
      day: d.getDate(),
      hour: d.getHours(),
      minute: d.getMinutes(),
      second: d.getSeconds(),
      dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()],
      monthName: monthsAbbr[d.getMonth()],
    })
  })
})

describe('getMonth / getDate / getDay', () => {
  it('return the abbreviated month, day-of-month, and full day name', () => {
    const d = new Date(SAMPLE_DATE)
    expect(getMonth(SAMPLE_DATE)).toBe(monthsAbbr[d.getMonth()])
    expect(getDate(SAMPLE_DATE)).toBe(d.getDate())
    expect(getDay(SAMPLE_DATE)).toBe(
      ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()],
    )
  })
})

describe('subtractDates', () => {
  it('returns the raw millisecond difference with no unit given', () => {
    expect(subtractDates('2024-01-02T00:00:00.000Z', '2024-01-01T00:00:00.000Z')).toBe(24 * 60 * 60 * 1000)
  })

  it('converts to days when unit is "days"', () => {
    expect(subtractDates('2024-01-02T00:00:00.000Z', '2024-01-01T00:00:00.000Z', 'days')).toBe(1)
  })

  it('converts to hours when unit is "hours"', () => {
    expect(subtractDates('2024-01-01T12:00:00.000Z', '2024-01-01T00:00:00.000Z', 'hours')).toBe(12)
  })

  it('is negative when date1 is earlier than date2', () => {
    expect(subtractDates('2024-01-01T00:00:00.000Z', '2024-01-02T00:00:00.000Z', 'days')).toBe(-1)
  })
})
