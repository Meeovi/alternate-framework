import type { RequestOptions, APIResponse } from '@meeovi/types'

export interface TransportAdapter {
  request<T = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    options?: RequestOptions
  ): Promise<APIResponse<T>>
}