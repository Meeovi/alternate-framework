// TODO: Replace with types from shared contracts if needed
type APIResponse<T> = { data?: T; error?: string }
type Result<T> = { ok: true; data: T } | { ok: false; error: string }

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
