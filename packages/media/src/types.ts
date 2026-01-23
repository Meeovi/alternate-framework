export interface MediaAsset {
  id: string
  url: string
  alt?: string
  width?: number
  height?: number
  [key: string]: any
}

export interface MediaProvider {
  upload(file: File): Promise<MediaAsset>
  getUrl(id: string): Promise<string>
}
