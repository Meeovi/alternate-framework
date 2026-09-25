import { useAssetUpload } from '#shared/app/composables/media/useAssetUpload'

interface UploadFileParams {
  imageFile?: File | null
  documentFile?: File | null
  videoFile?: File | null
  audioFile?: File | null
  category?: string
}

// Uploads go to Pixanomy (see useAssetUpload), not Directus — so these are
// public URLs to store on the record, not Directus file ids.
export default async function uploadFile({ imageFile, documentFile, videoFile, audioFile, category = 'posts' }: UploadFileParams) {
  const { upload } = useAssetUpload()
  const uploadedFiles = {
    imageUrl: null as string | null,
    documentUrl: null as string | null,
    videoUrl: null as string | null,
    audioUrl: null as string | null,
  }

  try {
    if (imageFile) uploadedFiles.imageUrl = (await upload(imageFile, { category })).url
    if (documentFile) uploadedFiles.documentUrl = (await upload(documentFile, { category })).url
    if (videoFile) uploadedFiles.videoUrl = (await upload(videoFile, { category })).url
    if (audioFile) uploadedFiles.audioUrl = (await upload(audioFile, { category })).url

    return uploadedFiles
  } catch (error) {
    console.error('Error uploading files:', error)
    throw error
  }
}
