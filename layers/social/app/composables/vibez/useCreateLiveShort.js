import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'

export default async function useCreateLiveShort(dialogRef) {
  const { $createItem } = useNuxtApp()

  const form = reactive({})
  const formError = ref('')
  const formSuccess = ref('')
  const recordingError = ref('')
  const recordingSupported = ref(false)
  const recording = ref(false)
  const submitting = ref(false)
  const recordedVideoFile = ref(null)
  const recordedVideoUrl = ref('')
  const cameraStream = ref(null)
  const previewEl = ref(null)
  const mediaRecorder = ref(null)
  const recordedChunks = ref([])

  const { data: shortFields, error, pending } = await useAsyncData('vibe-shorts-schema-fields', async () => {
    const resp = await readFieldsByCollection('shorts')
    return Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp) ? resp : [])
  })

  for (const field of shortFields.value || []) {
    if (field?.field && !(field.field in form)) {
      form[field.field] = null
    }
  }

  const getVideoDuration = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.preload = 'metadata'

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)
        resolve(video.duration)
      }

      video.onerror = () => {
        reject(new Error('Invalid video recording.'))
      }

      video.src = URL.createObjectURL(file)
    })
  }

  const stopCameraStream = () => {
    if (cameraStream.value) {
      cameraStream.value.getTracks().forEach((track) => track.stop())
      cameraStream.value = null
    }

    if (previewEl.value) {
      previewEl.value.srcObject = null
    }
  }

  const clearRecording = () => {
    if (recordedVideoUrl.value) {
      URL.revokeObjectURL(recordedVideoUrl.value)
    }

    recordedChunks.value = []
    recordedVideoFile.value = null
    recordedVideoUrl.value = ''
    recordingError.value = ''
    if (form.video) {
      form.video = null
    }
    if (form.duration) {
      form.duration = null
    }
  }

  const startRecording = async () => {
    recordingError.value = ''

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      cameraStream.value = stream
      recordingSupported.value = true

      if (previewEl.value) {
        previewEl.value.srcObject = stream
      }

      const mimeTypes = [
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4',
      ]
      const supportedMimeType = mimeTypes.find((type) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) || ''
      const recorder = new MediaRecorder(stream, supportedMimeType ? { mimeType: supportedMimeType } : undefined)

      mediaRecorder.value = recorder
      recordedChunks.value = []

      recorder.ondataavailable = (event) => {
        if (event.data?.size) {
          recordedChunks.value.push(event.data)
        }
      }

      recorder.onstop = async () => {
        const blob = new Blob(recordedChunks.value, { type: recorder.mimeType || 'video/webm' })
        const extension = blob.type.includes('mp4') ? 'mp4' : 'webm'
        const file = new File([blob], `live-recording-${Date.now()}.${extension}`, { type: blob.type || 'video/webm' })

        recordedVideoFile.value = file
        if (recordedVideoUrl.value) {
          URL.revokeObjectURL(recordedVideoUrl.value)
        }
        recordedVideoUrl.value = URL.createObjectURL(blob)

        try {
          form.duration = Math.round(await getVideoDuration(file))
        } catch (err) {
          console.error('Failed to read recording duration:', err)
        }

        stopCameraStream()

        if (previewEl.value) {
          previewEl.value.srcObject = null
          previewEl.value.src = recordedVideoUrl.value
          previewEl.value.load()
        }
      }

      recorder.start()
      recording.value = true
    } catch (err) {
      recordingError.value = err?.message || 'Failed to access camera and microphone.'
      stopCameraStream()
      recording.value = false
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.value?.state === 'recording') {
      mediaRecorder.value.stop()
    }

    recording.value = false
  }

  const submitForm = async () => {
    formError.value = ''
    formSuccess.value = ''
    recordingError.value = ''
    submitting.value = true

    try {
      const payload = { ...form }

      if (recordedVideoFile.value) {
        const uploadedFiles = await uploadFiles({ videoFile: recordedVideoFile.value })
        payload.video = uploadedFiles?.videoId || payload.video || null
      }

      await createItem('shorts', payload)
      formSuccess.value = 'Vibe created successfully.'

      for (const key of Object.keys(form)) {
        form[key] = null
      }

      clearRecording()
      if (dialogRef) {
        dialogRef.value = false
      }
    } catch (err) {
      formError.value = (err && err.message) ? err.message : 'Failed to create vibe.'
    } finally {
      submitting.value = false
    }
  }

  onMounted(() => {
    recordingSupported.value = typeof navigator !== 'undefined'
      && !!navigator.mediaDevices?.getUserMedia
      && typeof MediaRecorder !== 'undefined'
  })

  onBeforeUnmount(() => {
    clearRecording()
    stopCameraStream()
  })

  return {
    form,
    formError,
    formSuccess,
    shortFields,
    pending,
    error,
    recordingError,
    recordingSupported,
    recording,
    submitting,
    recordedVideoUrl,
    cameraStream,
    previewEl,
    startRecording,
    stopRecording,
    clearRecording,
    submitForm,
  }
}