import { getCookie, setCookie, deleteCookie } from 'h3'

const COOKIE_NAME = 'magento_customer_token'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export function getMagentoCustomerToken(event) {
  return getCookie(event, COOKIE_NAME) || null
}

export function setMagentoCustomerToken(event, token: string) {
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
}

export function clearMagentoCustomerToken(event) {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}
