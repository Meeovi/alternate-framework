export interface MediaItem {
  id: string
  url: string
  type: 'image' | 'video' | 'audio' | string
  createdAt?: string
  [key: string]: any
}

export interface MediaAdapter {
  upload(file: File): Promise<MediaItem>
  list(): Promise<MediaItem[]>
}