import type { APIResponse, Result } from '@meeovi/types'

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
