/**
 * Person segmentation for backgrounds: MediaPipe's selfie segmenter, run in
 * the browser (no server cost). Its WebAssembly and model are served by
 * Meeovi (layers/social/nuxt.config.ts → /mediapipe/wasm,
 * public/mediapipe/selfie_segmenter.tflite). Loaded the first time a
 * background is picked.
 */
type Mask = { width: number, height: number, data: Float32Array }
type Segmenter = { segment: (frame: TexImageSource) => Mask | null, close: () => void }

let loading: Promise<Segmenter> | null = null

async function create(delegate: 'GPU' | 'CPU') {
  const { FilesetResolver, ImageSegmenter } = await import('@mediapipe/tasks-vision')
  const fileset = await FilesetResolver.forVisionTasks('/mediapipe/wasm')
  return ImageSegmenter.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: '/mediapipe/selfie_segmenter.tflite', delegate },
    runningMode: 'VIDEO',
    outputCategoryMask: false,
    outputConfidenceMasks: true,
  })
}

export function loadSegmenter(): Promise<Segmenter> {
  if (loading) return loading
  loading = (async () => {
    const segmenter = await create('GPU').catch(() => create('CPU'))
    // VIDEO mode needs ever-increasing timestamps, also when the editor
    // seeks back or the export starts over from 0.
    let last = 0
    return {
      segment(frame) {
        last = Math.max(last + 1, Math.round(performance.now()))
        let out: Mask | null = null
        segmenter.segmentForVideo(frame as any, last, (result) => {
          const mask = result.confidenceMasks?.[0]
          if (mask) out = { width: mask.width, height: mask.height, data: new Float32Array(mask.getAsFloat32Array()) }
        })
        return out
      },
      close: () => { segmenter.close(); loading = null },
    }
  })()
  loading.catch(() => { loading = null })
  return loading
}
