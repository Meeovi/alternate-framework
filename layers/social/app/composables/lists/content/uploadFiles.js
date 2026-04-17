import useContentAdapter from '../../useContentAdapter'

export default async function uploadFile({ imageFile, documentFile, videoFile, audioFile }) {
  const content = useContentAdapter()
  const uploadedFiles = {}

  try {
    const tryUpload = async (file) => {
      const form = new FormData()
      form.append('file', file)
      if (!content || typeof content.uploadFiles !== 'function') {
        throw new Error('No available file upload mechanism')
      }

      const resp = await content.uploadFiles(form)
      return resp?.data || resp
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
