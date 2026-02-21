import { uploadFiles } from '@mframework/directus-client';

export default async function uploadFile({ imageFile, documentFile, videoFile, audioFile }) {
  const content = useContentAdapter()
  const nuxt = typeof useNuxtApp !== 'undefined' ? useNuxtApp() : (globalThis && globalThis.__NUXT_APP) || {}
  const uploadedFiles = {}

  try {
    // helper to attempt adapter upload, fallback to directus SDK helper
    const tryUpload = async (file) => {
      const form = new FormData()
      form.append('file', file)
      if (content && typeof content.createItem === 'function') {
        try {
          const resp = await content.createItem('files', form)
          return resp?.data || resp
        } catch (e) {
          // ignore and fallback
        }
      }
      if (nuxt && nuxt.$directus) {
        const { uploadFiles } = await import('@mframework/directus-client').catch(() => ({}))
        if (typeof nuxt.$directus.request === 'function' && typeof uploadFiles === 'function') {
          return await nuxt.$directus.request(uploadFiles(form))
        }
      }
      throw new Error('No available file upload mechanism')
    }

    if (imageFile) {
      const uploadedImage = await tryUpload(imageFile)
      uploadedFiles.imageId = uploadedImage?.id || uploadedImage
    }
    if (documentFile) {
      const uploadedDocument = await tryUpload(documentFile)
      uploadedFiles.documentId = uploadedDocument?.id || uploadedDocument
    }
    if (videoFile) {
      const uploadedVideo = await tryUpload(videoFile)
      uploadedFiles.videoId = uploadedVideo?.id || uploadedVideo
    }
    if (audioFile) {
      const uploadedAudio = await tryUpload(audioFile)
      uploadedFiles.audioId = uploadedAudio?.id || uploadedAudio
    }

    return uploadedFiles
  } catch (error) {
    console.error('Error uploading files:', error)
    throw error
  }
}
