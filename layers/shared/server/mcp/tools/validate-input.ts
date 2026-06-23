import { z } from 'zod'
import { defineMcpTool } from '@nuxtjs/mcp-toolkit/server'

export default defineMcpTool({
  description: 'Validate common input formats like email and URL',
  inputSchema: {
    value: z.string().describe('Value to validate'),
    type: z.enum(['email', 'url']).describe('Type of validation'),
  },
  outputSchema: {
    isValid: z.boolean(),
    message: z.string(),
  },
  handler: async ({ value, type }) => {
    let isValid = false
    let message = ''

    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      isValid = emailRegex.test(value)
      message = isValid ? 'Valid email address' : 'Invalid email format'
    }
    else if (type === 'url') {
      try {
        new URL(value)
        isValid = true
        message = 'Valid URL'
      }
      catch {
        message = 'Invalid URL format'
      }
    }

    return {
      structuredContent: { isValid, message },
    }
  },
})
