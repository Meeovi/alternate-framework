/**
 * File fields (FileUploadField / the JSON Forms file renderer) hold a raw
 * `File` in the form model, which can't be sent as JSON. Before submitting,
 * upload every File to the host app's upload endpoint — in Meeovi that's
 * POST /api/assets/upload, which stores it in Pixanomy (app.pixanomy.com) —
 * and replace it with the returned public URL.
 */
export const DEFAULT_UPLOAD_ENDPOINT = '/api/assets/upload'

const isFile = (value: unknown): value is File =>
  typeof File !== 'undefined' && value instanceof File

export async function uploadFileValues<T extends Record<string, any>> (
  model: T,
  endpoint: string = DEFAULT_UPLOAD_ENDPOINT,
  category = 'forms',
): Promise<T> {
  const out: Record<string, any> = { ...model }

  for (const [key, value] of Object.entries(model)) {
    const files = Array.isArray(value) ? value.filter(isFile) : isFile(value) ? [value] : []
    if (!files.length) continue

    const body = new FormData()
    body.append('category', category)
    for (const file of files) body.append('file', file, file.name)

    const res = await $fetch<{ assets: { url: string }[] }>(endpoint, { method: 'POST', body })
    const urls = res.assets.map((a) => a.url)
    out[key] = Array.isArray(value) ? urls : urls[0] ?? null
  }

  return out as T
}
