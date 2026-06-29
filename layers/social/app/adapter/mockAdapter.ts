// social/mockAdapter.ts

import { SocialAdapter } from './SocialAdapter'

let posts: any[] = []
let comments: any[] = []
let users: any[] = []
let spaces: any[] = []
let vibez: { id: number; url: string }[] = []
let lives: any[] = []

export const mockAdapter: SocialAdapter = {
  // POSTS
  getPosts: async () => posts,
  getPost: async ({ postId }) => posts.find(p => p.id === postId),
  createPost: async (data) => {
    const post = { id: Date.now(), ...data }
    posts.push(post)
    return post
  },
  deletePost: async ({ postId }) => {
    posts = posts.filter(p => p.id !== postId)
    return { success: true }
  },

  // COMMENTS
  getComments: async ({ postId }) => comments.filter(c => c.postId === postId),
  createComment: async ({ postId, ...data }) => {
    const comment = { id: Date.now(), postId, ...data }
    comments.push(comment)
    return comment
  },

  // FEEDS
  getFeed: async () => posts,
  getUserFeed: async ({ userId }) => posts.filter(p => p.userId === userId),

  // VIBEZ
  getVibez: async () => vibez,
  uploadVibe: async (data) => {
    const vibe = { id: Date.now(), url: 'mock-video-url', ...Object.fromEntries(data) }
    vibez.push(vibe)
    return vibe
  },

  // SPACES
  getSpaces: async () => spaces,
  createSpace: async (data) => {
    const space = { id: Date.now(), ...data }
    spaces.push(space)
    return space
  },

  // USER
  getUser: async ({ userId }) => users.find(u => u.id === userId),
  searchUsers: async ({ query }) =>
    users.filter(u => u.name.toLowerCase().includes(query.toLowerCase()))
}
