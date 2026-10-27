import { describe, expect, it, vi } from 'vitest'

// The helpers under test are pure; the module's DB and Directus clients are
// stubbed so importing it touches neither.
vi.mock('#auth/server/utils/drizzle', () => ({ db: {} }))
vi.mock('@directus/sdk', () => ({
  createDirectus: () => ({ with() { return this } }),
  rest: () => ({}),
  staticToken: () => ({}),
  readItems: () => ({}),
  createItem: () => ({}),
}))

const {
  daysUntilBirthday, isBirthdayNear, isMissingColumn, parseDate, resolveToday, validBirthDate,
} = await import('../../server/utils/birthdays')

const d = (iso: string) => parseDate(iso)!

describe('parseDate', () => {
  it('accepts real calendar dates only', () => {
    expect(parseDate('1990-02-28')?.toISOString()).toBe('1990-02-28T00:00:00.000Z')
    expect(parseDate('1990-02-30')).toBeNull()
    expect(parseDate('2001-02-29')).toBeNull()
    expect(parseDate('28/02/1990')).toBeNull()
    expect(parseDate(null)).toBeNull()
  })
})

describe('daysUntilBirthday', () => {
  it('is 0 on the day, regardless of the birth year', () => {
    expect(daysUntilBirthday(d('1990-10-27'), d('2026-10-27'))).toBe(0)
  })
  it('counts forward, wrapping into next year', () => {
    expect(daysUntilBirthday(d('1990-10-30'), d('2026-10-27'))).toBe(3)
    expect(daysUntilBirthday(d('1990-10-26'), d('2026-10-27'))).toBe(364)
    expect(daysUntilBirthday(d('1990-01-02'), d('2026-12-31'))).toBe(2)
  })
  it('celebrates 29 February on 28 February in other years', () => {
    expect(daysUntilBirthday(d('2000-02-29'), d('2027-02-28'))).toBe(0)
    expect(daysUntilBirthday(d('2000-02-29'), d('2028-02-28'))).toBe(1)
  })
})

describe('isBirthdayNear', () => {
  const today = d('2026-10-27')
  it('allows the day before, the day and the day after', () => {
    expect(isBirthdayNear(d('1990-10-26'), today)).toBe(true)
    expect(isBirthdayNear(d('1990-10-27'), today)).toBe(true)
    expect(isBirthdayNear(d('1990-10-28'), today)).toBe(true)
  })
  it('refuses anything further away', () => {
    expect(isBirthdayNear(d('1990-10-25'), today)).toBe(false)
    expect(isBirthdayNear(d('1990-10-29'), today)).toBe(false)
  })
})

describe('resolveToday', () => {
  const now = new Date('2026-10-27T23:30:00Z')
  it("uses the browser's date when within a day of the server's", () => {
    expect(resolveToday('2026-10-28', now).toISOString().slice(0, 10)).toBe('2026-10-28')
    expect(resolveToday('2026-10-26', now).toISOString().slice(0, 10)).toBe('2026-10-26')
  })
  it("falls back to the server's UTC date otherwise", () => {
    expect(resolveToday('2026-11-05', now).toISOString().slice(0, 10)).toBe('2026-10-27')
    expect(resolveToday('nonsense', now).toISOString().slice(0, 10)).toBe('2026-10-27')
  })
})

describe('validBirthDate', () => {
  const now = new Date('2026-10-27T12:00:00Z')
  it('accepts past dates from 1900 on', () => {
    expect(validBirthDate('1990-05-01', now)).toBe('1990-05-01')
  })
  it('refuses future, pre-1900 and invalid dates', () => {
    expect(validBirthDate('2027-01-01', now)).toBeNull()
    expect(validBirthDate('1899-12-31', now)).toBeNull()
    expect(validBirthDate('1990-13-01', now)).toBeNull()
  })
})

describe('isMissingColumn', () => {
  it('spots Postgres "undefined column", directly or wrapped', () => {
    expect(isMissingColumn({ code: '42703' })).toBe(true)
    expect(isMissingColumn({ cause: { code: '42703' } })).toBe(true)
    expect(isMissingColumn(new Error('other'))).toBe(false)
  })
})
