export enum ImageType {
  THUMBNAIL = 'thumbnail',
  SMALL = 'small',
  IMAGE = 'image',
}

export interface ImageDescriptor {
  src: string
  alt?: string
  label?: string
}

export const ImageDefaults: Partial<ImageDescriptor> = {}

export default ImageDefaults
