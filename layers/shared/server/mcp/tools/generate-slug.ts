import { z } from 'zod'
import { defineMcpTool } from '@nuxtjs/mcp-toolkit/server'

export default defineMcpTool({
  description: 'Generate a URL-friendly slug from a title',
  inputSchema: {
    title: z.string().describe('Title to convert to slug'),
    separator: z.enum(['-', '_']).default('-').describe('Word separator'),
  },
  outputSchema: {
    slug: z.string(),
  },
  handler: async ({ title, separator }) => {
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036F]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .trim()
      .replace(/\s+/g, separator) // Replace spaces
      .replace(new RegExp(`${separator}+`, 'g'), separator) // Remove duplicate separators

    return {
      structuredContent: { slug },
    }
  },
})
