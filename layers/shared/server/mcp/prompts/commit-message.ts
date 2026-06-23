import { z } from 'zod'
import { defineMcpPrompt } from '@nuxtjs/mcp-toolkit/server'

export default defineMcpPrompt({
  name: 'commit-message',
  title: 'Commit Message',
  description: 'Generate a conventional commit message',
  inputSchema: {
    changes: z.string().describe('Description of the changes made'),
    type: z.enum(['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore']).default('feat'),
    scope: z.string().optional().describe('Scope of the change (e.g., auth, api)'),
  },
  handler: async ({ changes, type, scope }) => {
    const scopeText = scope ? `(${scope})` : ''

    return `Generate a commit message following this format:

${type}${scopeText}: <description>

Changes made:
${changes}

Guidelines:
- Use imperative mood ("add" not "added")
- Keep the description under 72 characters
- Be specific and concise`
  },
})
