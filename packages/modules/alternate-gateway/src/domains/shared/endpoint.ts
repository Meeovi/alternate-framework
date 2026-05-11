export interface EndpointConfig<
  Params = unknown,
  Body = unknown,
  Response = unknown
> {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  params?: Params
  body?: Body
  response: Response
}