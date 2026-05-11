import type { ConfirmDialogChoice, ConfirmDialogOptions } from '../../../../shared/shared/types'

export async function openConfirmDialog(options: ConfirmDialogOptions | string): Promise<ConfirmDialogChoice> {
  const payload: ConfirmDialogOptions = typeof options === 'string'
    ? { title: options }
    : options

  const confirmed = globalThis.confirm(payload.description || payload.title)
  return {
    choice: confirmed ? 'confirm' : 'cancel',
  }
}

export async function openPublishDialog(_key: 'dialog' | 'home' | 'quote' | 'intent', _draft?: unknown) {
  await navigateTo('/connect')
}

export async function openPreviewHelp() {
  await navigateTo('/help')
}

export async function openErrorDialog(options: { title: string; messages: string[]; close?: string }) {
  const message = [options.title, ...options.messages].join('\n')
  globalThis.alert(message)
}
