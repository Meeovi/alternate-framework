import { z } from 'zod'
import { defineMcpPrompt } from '@nuxtjs/mcp-toolkit/server'

export default defineMcpPrompt({
  name: 'documentation',
  title: 'Generate Documentation',
  description: 'Create documentation for code',
  inputSchema: {
    code: z.string().describe('Code to document'),
    style: z.enum(['jsdoc', 'tsdoc', 'markdown']).default('jsdoc'),
  },
  handler: async ({ code, style }) => {
    return style === 'markdown'
      ? `Generate markdown documentation for this code:\n\n\`\`\`\n${code}\n\`\`\``
      : `Generate ${style.toUpperCase()} documentation for this code:\n\n\`\`\`\n${code}\n\`\`\``
  },
})
