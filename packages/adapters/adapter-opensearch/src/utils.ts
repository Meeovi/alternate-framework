import type { APIResponse, Result } from '@mframework/core'

export const unwrap = <T>(response: APIResponse<T>): Result<T> => {
  if ((response as any).error) {
    return {
      ok: false,
      error: (response as any).error
    }
  }

  return {
    ok: true,
    data: (response as any).data
  }
}

export default unwrap
