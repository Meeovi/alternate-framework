import { z } from 'zod'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'
import { defineMcpTool } from '@nuxtjs/mcp-toolkit/server'

export default defineMcpTool({
  description: 'Convert between JSON and YAML formats',
  inputSchema: {
    content: z.string().describe('Content to convert'),
    from: z.enum(['json', 'yaml']).describe('Source format'),
    to: z.enum(['json', 'yaml']).describe('Target format'),
  },
  handler: async ({ content, from, to }) => {
    let data: unknown
    if (from === 'json') {
      data = JSON.parse(content)
    }
    else {
      data = parseYaml(content)
    }

    if (to === 'json') return JSON.stringify(data, null, 2)
    return stringifyYaml(data)
  },
})
