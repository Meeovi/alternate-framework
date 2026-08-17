import type { SocialDriverContract, Comment, PostFilters } from 'alternate-sdk/contracts'
import { useSocialDriver } from '../useSocialDriver'

export const useComments = () => {
  const social = useSocialDriver()

  const getComments = async (postId: string | number, opts?: { limit?: number; offset?: number }): Promise<Comment[]> => {
    return social.comments.getComments?.(String(postId), opts) ?? []
  }

  const getThread = async (commentId: string | number): Promise<Comment | null> => {
    return social.comments.getThread?.(String(commentId)) ?? null
  }

  const createComment = async (postId: string | number, content: string): Promise<Comment> => {
    return social.comments.createComment?.(String(postId), { content }) as Promise<Comment>
  }

  const replyToComment = async (commentId: string | number, content: string): Promise<Comment> => {
    return social.comments.replyToComment?.(String(commentId), { content }) as Promise<Comment>
  }

  const deleteComment = async (commentId: string | number): Promise<{ success: boolean }> => {
    return social.comments.deleteComment?.(String(commentId)) ?? { success: false }
  }

  const reactToComment = async (commentId: string | number, reaction: string): Promise<{ success: boolean }> => {
    return social.comments.reactToComment?.(String(commentId), reaction) ?? { success: false }
  }

  const reportComment = async (commentId: string | number, reason: string): Promise<{ success: boolean }> => {
    return social.comments.reportComment?.(String(commentId), reason) ?? { success: false }
  }

  return {
    getComments,
    getThread,
    createComment,
    replyToComment,
    deleteComment,
    reactToComment,
    reportComment
  }
}
