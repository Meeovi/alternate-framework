// The PCI Software Security Framework (SSF) is a modern, comprehensive standard designed to ensure the secure design, development, and maintenance of payment software. It provides a structured approach to identifying and mitigating security risks throughout the software development lifecycle, helping organizations protect sensitive payment data and maintain compliance with industry regulations.

import { useRuntimeConfig } from 'nuxt/app'

type SecurityFlags = {
  turnstileEnabled: boolean
  cloudflareEnabled: boolean
}

function maskSecret(value: string | undefined) {
  if (!value) return ''
  if (value.length <= 6) return '***'
  return `${value.slice(0, 3)}***${value.slice(-3)}`
}

export function useSSF() {
  const config = useRuntimeConfig()
  const publicCfg = (config as any)?.public || {}

  function getFlags(): SecurityFlags {
    const turnstileSiteKey = publicCfg?.turnstile?.siteKey || publicCfg?.cloudflare?.turnstileSiteKey
    const cloudflareZone = publicCfg?.cloudflare?.zone || publicCfg?.cloudflare?.zoneId

    return {
      turnstileEnabled: Boolean(turnstileSiteKey),
      cloudflareEnabled: Boolean(cloudflareZone),
    }
  }

  function isSecureContext() {
    if (process.server) return true
    if (typeof window === 'undefined') return true
    return window.isSecureContext || window.location.protocol === 'https:'
  }

  function getRequestFingerprint(headers?: Record<string, string | string[] | undefined>) {
    const source = headers || {}
    const ip = String(source['x-forwarded-for'] || source['cf-connecting-ip'] || '')
    const ua = String(source['user-agent'] || '')
    return `${ip}|${ua}`
  }

  return {
    flags: getFlags(),
    secureContext: isSecureContext(),
    cloudflare: publicCfg.cloudflare || null,
    // Never expose server-only secret values directly to callers.
    adminKeyMasked: process.server ? maskSecret((config as any)?.adminKey) : '',
    isSecureContext,
    getRequestFingerprint,
  }
}

export default useSSF