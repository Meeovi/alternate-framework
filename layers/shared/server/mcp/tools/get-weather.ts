import { z } from 'zod'
import { defineMcpTool } from '@nuxtjs/mcp-toolkit/server'

export default defineMcpTool({
  description: 'Get current weather for a city',
  inputSchema: {
    city: z.string().describe('City name'),
  },
  cache: '15m',
  handler: async ({ city }) => {
    return await $fetch(`https://wttr.in/${city}?format=j1`)
  },
})
