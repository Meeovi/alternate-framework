/**
 * Simple MCP (Model Context Protocol) handler implementation
 * Implements JSON-RPC 2.0 protocol without external dependencies
 */

interface Tool {
  name: string
  description: string
  schema?: Record<string, any>
  handler: (params: any) => Promise<any>
}

interface McpResponse {
  jsonrpc: string
  id?: string | number
  result?: any
  error?: {
    code: number
    message: string
    data?: any
  }
}

export function createSimpleMcpHandler(tools: Tool[]) {
  return async (req: Request): Promise<Response> => {
    try {
      // Only accept POST requests for tool calls
      if (req.method !== 'POST' && req.method !== 'GET') {
        return new Response(
          JSON.stringify({
            jsonrpc: '2.0',
            error: {
              code: -32600,
              message: 'Invalid Request',
              data: 'Only GET and POST methods are supported'
            }
          }),
          { status: 405, headers: { 'Content-Type': 'application/json' } }
        )
      }

      const body = await req.json()

      // Handle tool list request (GET or OPTIONS)
      if (req.method === 'GET' || body.method === 'tools/list') {
        return new Response(
          JSON.stringify({
            jsonrpc: '2.0',
            id: body.id || null,
            result: {
              tools: tools.map(t => ({
                name: t.name,
                description: t.description,
                inputSchema: t.schema || { type: 'object', properties: {} }
              }))
            }
          }),
          { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      // Handle tool call
      if (body.method === 'tools/call') {
        const { name, arguments: args } = body.params || {}
        
        const tool = tools.find(t => t.name === name)
        if (!tool) {
          return new Response(
            JSON.stringify({
              jsonrpc: '2.0',
              id: body.id,
              error: {
                code: -32601,
                message: 'Method not found',
                data: `Tool '${name}' not found`
              }
            } as McpResponse),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
          )
        }

        try {
          const result = await tool.handler(args || {})
          return new Response(
            JSON.stringify({
              jsonrpc: '2.0',
              id: body.id,
              result: {
                content: Array.isArray(result.content) 
                  ? result.content 
                  : [{ type: 'text', text: JSON.stringify(result) }]
              }
            } as McpResponse),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        } catch (error) {
          return new Response(
            JSON.stringify({
              jsonrpc: '2.0',
              id: body.id,
              error: {
                code: -32603,
                message: 'Internal error',
                data: error instanceof Error ? error.message : String(error)
              }
            } as McpResponse),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          )
        }
      }

      // Unknown method
      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          id: body.id,
          error: {
            code: -32601,
            message: 'Method not found'
          }
        } as McpResponse),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          error: {
            code: -32700,
            message: 'Parse error',
            data: error instanceof Error ? error.message : String(error)
          }
        } as McpResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
}

export default defineNitroPlugin(() => {
  // Keep this module compatible with Nitro plugin auto-loading.
})
