// layers/social/validation/socialValidation.ts

export const validatePostContent = (content: string) => {
  if (!content || !content.trim()) throw new Error('Post content is required')
  if (content.length > 5000) throw new Error('Post content too long')
}

export const validateCommentContent = (content: string) => {
  if (!content || !content.trim()) throw new Error('Comment content is required')
  if (content.length > 2000) throw new Error('Comment content too long')
}

export const validateSpaceName = (name: string) => {
  if (!name || !name.trim()) throw new Error('Space name is required')
}

export const validateUsername = (username: string) => {
  if (!username || !username.trim()) throw new Error('Username is required')
  if (username.length < 3 || username.length > 30) throw new Error('Username must be between 3 and 30 characters')
  if (!/^[a-zA-Z0-9_]+$/.test(username)) throw new Error('Username can only contain letters, numbers, and underscores')
}

export const validateSpaceDescription = (description: string) => {
  if (description && description.length > 1000) throw new Error('Space description too long')
}

export const validateCircleName = (circle: string) => {
  if (!circle || !circle.trim()) throw new Error('Circle name is required')
  if (circle.length > 50) throw new Error('Circle name too long')
}

export const validateSpaceId = (spaceId: string | number) => {
  if (!spaceId) throw new Error('Space ID is required')
}

export const validateUserId = (userId: string | number) => {
  if (!userId) throw new Error('User ID is required')
}