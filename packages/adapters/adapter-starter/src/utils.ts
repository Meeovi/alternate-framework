import type { APIResponse, Result } from 'alternate-gateway/core'

export const unwrap = <T>(response: APIResponse<T>): Result<T> => {
  if (response.error) {
    return {
      ok: false,
      error: response.error
    }
  }

  return {
    ok: true,
    data: response.data
  }
}