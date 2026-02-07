import type { RequestOptions, APIResponse } from '@mframework/core'

export interface TransportAdapter {
  request<T = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    options?: RequestOptions
  ): Promise<APIResponse<T>>
}