import { z } from 'zod'
import { defineMcpTool, type McpRequestExtra } from '@nuxtjs/mcp-toolkit/server'

export default defineMcpTool({
  description: 'Echo back a message',
  inputSchema: { message: z.string() },
  handler: async ({ message }, extra: McpRequestExtra) => {
    return `Echo: ${message}`
  },
})
