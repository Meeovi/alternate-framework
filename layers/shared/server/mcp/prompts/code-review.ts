import { z } from 'zod'
import { defineMcpPrompt } from '@nuxtjs/mcp-toolkit/server'

export default defineMcpPrompt({
  name: 'code-review',
  title: 'Code Review',
  description: 'Generate a code review prompt',
  inputSchema: {
    code: z.string().describe('Code to review'),
    language: z.string().describe('Programming language'),
    focus: z.enum(['performance', 'security', 'style', 'all']).default('all'),
  },
  handler: async ({ code, language, focus }) => {
    const focusText = focus === 'all'
      ? 'performance, security, and style'
      : focus

    return `Please review this ${language} code focusing on ${focusText}:\n\n\`\`\`${language}\n${code}\n\`\`\``
  },
})
