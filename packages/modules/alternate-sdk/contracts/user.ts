export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  avatarUrl?: string
  roles?: string[]
  createdAt?: string | Date
  updatedAt?: string | Date
  [key: string]: any
}