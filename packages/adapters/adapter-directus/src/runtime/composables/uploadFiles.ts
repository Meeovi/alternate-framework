import useDirectusRequest from './useDirectusRequest'

interface UploadFileParams {
  imageFile?: File | null
  documentFile?: File | null
  videoFile?: File | null
  audioFile?: File | null
}

export default async function uploadFile({ imageFile, documentFile, videoFile, audioFile }: UploadFileParams) {
  const { uploadFiles: adapterUpload } = useDirectusRequest()
  const uploadedFiles = {
    imageId: null,
    documentId: null,
    videoId: null,
    audioId: null,
  }

  try {
    if (imageFile) {
      const formDataImage = new FormData()
      formDataImage.append('file', imageFile)
      const uploadedImage = await adapterUpload(formDataImage)
      uploadedFiles.imageId = uploadedImage?.id
    }

    if (documentFile) {
      const formDataDocument = new FormData()
      formDataDocument.append('file', documentFile)
      const uploadedDocument = await adapterUpload(formDataDocument)
      uploadedFiles.documentId = uploadedDocument?.id
    }

    if (videoFile) {
      const formDataVideo = new FormData()
      formDataVideo.append('file', videoFile)
      const uploadedVideo = await adapterUpload(formDataVideo)
      uploadedFiles.videoId = uploadedVideo?.id
    }

    if (audioFile) {
      const formDataAudio = new FormData()
      formDataAudio.append('file', audioFile)
      const uploadedAudio = await adapterUpload(formDataAudio)
      uploadedFiles.audioId = uploadedAudio?.id
    }

    return uploadedFiles
  } catch (error) {
    console.error('Error uploading files:', error)
    throw error
  }
}
