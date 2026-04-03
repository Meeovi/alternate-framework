// Local dialog composables for lists layer
import { ref } from 'vue'

export interface ConfirmDialogOptions {
  title?: string
  description?: string
  confirm?: string
  cancel?: string
}

export interface ConfirmDialogChoice {
  choice: 'confirm' | 'cancel'
}

const isConfirmOpen = ref(false)

export async function openConfirmDialog(options: ConfirmDialogOptions | string): Promise<ConfirmDialogChoice> {
  // Simple confirm implementation using native dialog
  // Parent app can override with custom dialog component
  const opts = typeof options === 'string' ? { title: options } : options
  
  const message = [
    opts.title,
    opts.description
  ].filter(Boolean).join('\n\n')
  
  const confirmed = confirm(message)
  
  return {
    choice: confirmed ? 'confirm' : 'cancel'
  }
}
