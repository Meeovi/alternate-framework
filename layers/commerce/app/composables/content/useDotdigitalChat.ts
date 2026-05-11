import { ref } from 'vue'
import { useState } from 'nuxt/app'
import useContentFallback from './useContent'

type DotdigitalChatConfig = {
  provider: 'dotdigital'
  enabled: boolean
  websiteId: string | number | null
  chatId: string | number | null
  scriptUrl: string | null
  launcherUrl?: string | null
  environment: string | null
  raw: Record<string, any>
}

declare global {
  interface Window {
    dotdigitalChat?: {
      open?: () => void
      show?: () => void
      toggle?: () => void
      close?: () => void
    }
    dotdigitalChatConfig?: Record<string, any>
  }
}

const SCRIPT_ID = 'dotdigital-chat-widget-script'
const STATE_KEY = 'commerce-dotdigital-chat-state'

export function useDotdigitalChat() {
  const state = useState(STATE_KEY, () => ({
    config: null as DotdigitalChatConfig | null,
    status: 'idle' as 'idle' | 'loading' | 'ready' | 'error',
    isOpen: false,
    error: null as string | null,
    initialized: false,
  }))

  const { getDotdigitalChatConfig } = useContentFallback()

  async function loadConfig(force = false) {
    if (state.value.config && !force) return state.value.config

    try {
      const config = await getDotdigitalChatConfig()
      state.value.config = config
      return config
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Failed to load Dotdigital chat config'
      return null
    }
  }

  function applyWindowConfig(config: DotdigitalChatConfig) {
    window.dotdigitalChatConfig = {
      websiteId: config.websiteId,
      chatId: config.chatId,
      environment: config.environment,
      ...(config.raw || {}),
    }
  }

  function loadScript(config: DotdigitalChatConfig) {
    if (!config.scriptUrl) {
      state.value.status = 'ready'
      return Promise.resolve(false)
    }

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    if (existing) {
      state.value.status = 'ready'
      return Promise.resolve(true)
    }

    state.value.status = 'loading'
    applyWindowConfig(config)

    return new Promise<boolean>((resolve) => {
      const script = document.createElement('script')
      script.id = SCRIPT_ID
      script.async = true
      script.src = config.scriptUrl || ''

      if (config.websiteId != null) script.dataset.websiteId = String(config.websiteId)
      if (config.chatId != null) script.dataset.chatId = String(config.chatId)
      if (config.environment) script.dataset.environment = config.environment

      script.onload = () => {
        state.value.status = 'ready'
        state.value.error = null
        resolve(true)
      }

      script.onerror = () => {
        state.value.status = 'error'
        state.value.error = 'Failed to load Dotdigital chat widget script'
        resolve(false)
      }

      document.head.appendChild(script)
    })
  }

  async function initialize(force = false) {
    if (state.value.initialized && !force) return state.value.config

    const config = await loadConfig(force)
    if (!config?.enabled) {
      state.value.status = 'idle'
      state.value.initialized = true
      return config
    }

    await loadScript(config)
    state.value.initialized = true
    return config
  }

  function canUseExternalWidget() {
    const widget = window.dotdigitalChat
    return Boolean(widget?.open || widget?.show || widget?.toggle)
  }

  function openExternalWidget() {
    const widget = window.dotdigitalChat
    if (widget?.open) return widget.open()
    if (widget?.show) return widget.show()
    if (widget?.toggle) return widget.toggle()
  }

  async function open() {
    await initialize()

    if (canUseExternalWidget()) {
      openExternalWidget()
      state.value.isOpen = true
      return
    }

    state.value.isOpen = true
  }

  function close() {
    if (window.dotdigitalChat?.close) {
      window.dotdigitalChat.close()
    }
    state.value.isOpen = false
  }

  async function toggle() {
    if (state.value.isOpen) {
      close()
      return
    }

    await open()
  }

  return {
    state,
    initialize,
    loadConfig,
    open,
    close,
    toggle,
    canUseExternalWidget,
  }
}

export default useDotdigitalChat