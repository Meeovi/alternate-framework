import { z } from 'zod'
import { defineMcpTool } from '@nuxtjs/mcp-toolkit/server'

export default defineMcpTool({
  description: 'Check if a URL endpoint is reachable',
  inputSchema: {
    url: z.string().url().describe('URL to check'),
    timeout: z.number().default(5000).describe('Timeout in milliseconds'),
  },
  outputSchema: {
    status: z.enum(['healthy', 'unhealthy']),
    responseTime: z.number().optional(),
    statusCode: z.number().optional(),
  },
  handler: async ({ url, timeout }) => {
    const start = Date.now()

    try {
      const response = await $fetch.raw(url, {
        timeout,
        method: 'HEAD',
      })

      const responseTime = Date.now() - start

      return {
        structuredContent: {
          status: 'healthy' as const,
          responseTime,
          statusCode: response.status,
        },
      }
    }
    catch (error) {
      const responseTime = Date.now() - start

      return {
        structuredContent: {
          status: 'unhealthy' as const,
          responseTime,
        },
      }
    }
  },
})
