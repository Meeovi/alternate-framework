import type { RequestOptions } from './request'
import type { APIResponse } from './response'

export interface TransportAdapter {
  request<T = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    options?: RequestOptions
  ): Promise<APIResponse<T>>
}