import { afterEach, describe, expect, it, vi } from 'vitest'
import phoneNumberPlugin, { sendPhoneOTP } from '../runtime/server'
import phoneNumberClient from '../runtime/client'

const NODE_ENV = process.env.NODE_ENV

afterEach(() => {
  process.env.NODE_ENV = NODE_ENV
  vi.restoreAllMocks()
})

describe('auth-phone-number', () => {
  it('refuses to send codes in production (no SMS provider yet)', async () => {
    process.env.NODE_ENV = 'production'
    await expect(sendPhoneOTP({ phoneNumber: '+15550000000', code: '123456' })).rejects.toThrow('Phone sign-in is not available yet.')
  })

  it('logs the code in development instead', async () => {
    process.env.NODE_ENV = 'development'
    const info = vi.spyOn(console, 'info').mockImplementation(() => {})
    await sendPhoneOTP({ phoneNumber: '+15550000000', code: '123456' })
    expect(info).toHaveBeenCalledWith('[phone-otp] dev OTP for', '+15550000000', '123456')
  })

  it('builds the server and client plugins', () => {
    expect(phoneNumberPlugin().id).toBe('phone-number')
    expect(phoneNumberClient().id).toBe('phoneNumber')
  })
})
