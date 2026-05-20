export interface MediaItem {
  id: string
  url: string
  type: 'image' | 'video'
  createdAt: string
}

export interface MediaAdapter {
  upload(file: File): Promise<MediaItem>
  list(): Promise<MediaItem[]>
}
