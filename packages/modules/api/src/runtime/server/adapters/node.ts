export function nodeAdapter(handler: any) {
  return async (req: any, res: any) => {
    const body = await new Promise((resolve) => {
      let data = ''
      req.on('data', (chunk: any) => (data += chunk))
      req.on('end', () => resolve(JSON.parse(data || '{}')))
    })

    await handler(
      { headers: req.headers, cookies: req.cookies, body },
      {
        setHeader: (k: string, v: string) => res.setHeader(k, v),
        statusCode: 200,
        end: (payload: string) => res.end(payload)
      }
    )
  }
}
