export function edgeAdapter(handler: any) {
  return async (request: Request) => {
    const body = await request.json().catch(() => ({}))

    const req = {
      headers: Object.fromEntries(request.headers.entries()),
      cookies: {},
      body
    }

    let status = 200
    const headers: Record<string, string> = {}

    const res = {
      setHeader: (k: string, v: string) => (headers[k] = v),
      statusCode: 200,
      end: (payload: string) => {
        status = res.statusCode
        return new Response(payload, { status, headers })
      }
    }

    return handler(req, res)
  }
}
