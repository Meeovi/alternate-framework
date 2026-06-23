import { z } from 'zod'
import { defineMcpPrompt } from '@nuxtjs/mcp-toolkit/server'

export default defineMcpPrompt({
  name: 'email-template',
  title: 'Email Template',
  description: 'Generate email from template',
  inputSchema: {
    recipient: z.string().describe('Recipient name'),
    subject: z.string().describe('Email subject'),
    tone: z.enum(['formal', 'casual', 'friendly']).default('friendly'),
  },
  handler: async ({ recipient, subject, tone }) => {
    const greeting = tone === 'formal'
      ? 'Dear'
      : tone === 'casual'
        ? 'Hi'
        : 'Hello'

    return `Write an email:\n\nTo: ${recipient}\nSubject: ${subject}\nTone: ${tone}\n\nGreeting: ${greeting}`
  },
})
