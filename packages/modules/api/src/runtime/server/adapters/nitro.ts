export function nitroAdapter(handler: any) {
  return async (event: any) => {
    const req = {
      headers: event.node.req.headers,
      cookies: event.node.req.cookies || {},
      body: await readBody(event)
    }

    const res: any = {
      headers: {},
      statusCode: 200,
      setHeader(key: string, value: string) {
        this.headers[key] = value
      },
      end(payload: string) {
        for (const [k, v] of Object.entries(this.headers)) {
          event.node.res.setHeader(k, v as string)
        }
        event.node.res.statusCode = this.statusCode
        event.node.res.end(payload)
      }
    }

    await handler(req, res)
  }
}
