import { describe, expect, it } from 'vitest'
import {
  COMMERCE_EVENT_NAMES, COMMERCE_EVENT_SCHEMAS, EventSchemaError, LICENSING_EVENT_NAMES, LICENSING_EVENT_SCHEMAS,
  parseCommerceEvent, parseLicensingEvent,
} from '../events'

describe('commerce events (frozen)', () => {
  it('names', () => {
    expect(COMMERCE_EVENT_NAMES).toEqual(['purchase.completed', 'purchase.refunded', 'subscription.renewed', 'subscription.expired', 'subscription.cancelled'])
    expect(Object.keys(COMMERCE_EVENT_SCHEMAS)).toEqual([...COMMERCE_EVENT_NAMES])
  })
  it('accepts the spec payloads', () => {
    expect(parseCommerceEvent({ event: 'purchase.completed', purchaseId: 'abc123', userId: 'user123', productId: 'prod123', licenseId: 'commercial' }))
      .toEqual({ event: 'purchase.completed', purchaseId: 'abc123', userId: 'user123', productId: 'prod123', licenseId: 'commercial' })
    expect(parseCommerceEvent({ event: 'purchase.refunded', purchaseId: 'abc123' })).toEqual({ event: 'purchase.refunded', purchaseId: 'abc123' })
    for (const event of ['subscription.renewed', 'subscription.expired'] as const) {
      expect(parseCommerceEvent({ event, licenseId: 'lic123' })).toEqual({ event, licenseId: 'lic123' })
    }
  })
  it('normalizes dates and drops unknown fields', () => {
    const e = parseCommerceEvent({ event: 'subscription.cancelled', licenseId: 'lic123', currentPeriodEndsAt: '2026-07-01T00:00:00Z', magentoOrderId: 9 })
    expect(e).toEqual({ event: 'subscription.cancelled', licenseId: 'lic123', currentPeriodEndsAt: new Date('2026-07-01T00:00:00Z') })
  })
  it('rejects bad payloads', () => {
    const bad = [
      null, 'purchase.completed', { event: 'purchase.partially_refunded', purchaseId: 'x' }, { event: 'order.placed' },
      { event: 'purchase.completed', purchaseId: 'x', userId: 'u', productId: 'p' },
      { event: 'purchase.refunded', purchaseId: '' },
      { event: 'purchase.refunded', purchaseId: 42 },
      { event: 'subscription.cancelled', licenseId: 'l' },
      { event: 'subscription.cancelled', licenseId: 'l', currentPeriodEndsAt: 'not a date' },
    ]
    for (const input of bad) expect(() => parseCommerceEvent(input)).toThrow(EventSchemaError)
  })
})

describe('webhook events (frozen)', () => {
  it('names', () => {
    expect(LICENSING_EVENT_NAMES).toEqual(['license.activated', 'license.revoked', 'license.expired', 'plugin.installed', 'plugin.removed'])
    expect(Object.keys(LICENSING_EVENT_SCHEMAS)).toEqual([...LICENSING_EVENT_NAMES])
  })
  it('accepts the spec payloads', () => {
    const payloads = [
      { event: 'license.activated', licenseId: 'lic123' },
      { event: 'license.revoked', licenseId: 'lic123', reason: 'refund' },
      { event: 'license.expired', licenseId: 'lic123' },
      { event: 'plugin.installed', pluginId: 'french-language-pack', licenseId: 'lic123' },
      { event: 'plugin.removed', pluginId: 'french-language-pack', licenseId: 'lic123' },
    ]
    for (const p of payloads) expect(parseLicensingEvent(p)).toEqual(p)
  })
  it('requires reason on revocations and pluginId on plugin events', () => {
    expect(() => parseLicensingEvent({ event: 'license.revoked', licenseId: 'l' })).toThrow(EventSchemaError)
    expect(() => parseLicensingEvent({ event: 'plugin.installed', licenseId: 'l' })).toThrow(EventSchemaError)
  })
})
