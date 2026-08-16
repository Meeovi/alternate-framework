import { describe, it, expect } from 'vitest'
import { createMailto, createTel } from '../../app/utils/links'

describe('createMailto', () => {
  it('builds a bare mailto with no params', () => {
    expect(createMailto('a@example.com')).toBe('mailto:a@example.com?')
  })

  it('encodes subject and body', () => {
    const link = createMailto('a@example.com', { subject: 'Hi there', body: 'Line 1&2' })
    expect(link).toBe('mailto:a@example.com?subject=Hi%20there&body=Line%201%262')
  })

  it('includes cc and bcc when provided', () => {
    const link = createMailto('a@example.com', { cc: 'b@example.com', bcc: 'c@example.com' })
    expect(link).toBe('mailto:a@example.com?cc=b%40example.com&bcc=c%40example.com')
  })
})

describe('createTel', () => {
  it('strips non-numeric characters', () => {
    expect(createTel('(555) 123-4567')).toBe('tel:5551234567')
  })

  it('adds a + prefix for an 11-digit number starting with country code 1', () => {
    expect(createTel('1-555-123-4567')).toBe('tel:+15551234567')
  })

  it('does not add + for a plain 10-digit number', () => {
    expect(createTel('555-123-4567')).toBe('tel:5551234567')
  })
})
