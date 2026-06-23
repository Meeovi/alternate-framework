export interface Post {
  id: string
  authorId: string
  content: string
  createdAt: string
  [key: string]: any
}

export interface SocialAdapter {
  listPosts(): Promise<Post[]>
  createPost(content: string): Promise<Post>
}