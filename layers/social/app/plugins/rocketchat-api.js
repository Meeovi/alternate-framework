// Custom Rocket.Chat API adapter factory for Vssue
export function RocketChatAPI(options = {}) {
  const baseURL = options.baseURL || process.env.ROCKETCHAT_URL
  const token = options.token || process.env.ROCKETCHAT_TOKEN
  const userId = options.userId || process.env.ROCKETCHAT_USER_ID

  return {
    async getComments({ issueId }) {
      const url = new URL(`${baseURL}/api/v1/channels.messages`)
      url.search = new URLSearchParams({ roomName: issueId }).toString()
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'X-Auth-Token': token,
          'X-User-Id': userId,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      return (data.messages || []).map(msg => ({
        id: msg._id,
        content: msg.msg,
        author: { login: msg.u?.username, avatar: msg.u?.avatar },
        createdAt: msg.ts,
        updatedAt: msg._updatedAt
      }))
    },

    async postComment({ issueId, content }) {
      const response = await fetch(`${baseURL}/api/v1/chat.postMessage`, {
        method: 'POST',
        headers: {
          'X-Auth-Token': token,
          'X-User-Id': userId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel: issueId,
          text: content
        })
      })
      const data = await response.json()
      return {
        id: data.message?._id,
        content: data.message?.msg,
        author: { login: data.message?.u?.username },
        createdAt: data.message?.ts
      }
    },

    async deleteComment({ commentId }) {
      await fetch(`${baseURL}/api/v1/chat.delete`, {
        method: 'POST',
        headers: {
          'X-Auth-Token': token,
          'X-User-Id': userId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ msgId: commentId })
      })
    },

    async updateComment({ commentId, content }) {
      const response = await fetch(`${baseURL}/api/v1/chat.update`, {
        method: 'POST',
        headers: {
          'X-Auth-Token': token,
          'X-User-Id': userId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          msgId: commentId,
          text: content
        })
      })
      const data = await response.json()
      return {
        id: data.message?._id,
        content: data.message?.msg,
        updatedAt: data.message?._updatedAt
      }
    },

    async getUser() {
      const response = await fetch(`${baseURL}/api/v1/me`, {
        headers: {
          'X-Auth-Token': token,
          'X-User-Id': userId
        }
      })
      const data = await response.json()
      return {
        login: data.username,
        avatar: data.avatar,
        homepage: `${baseURL}/direct/${data.username}`
      }
    }
  }
}

// Provide a Nuxt plugin wrapper so Nuxt recognizes this file as a plugin.
export default defineNuxtPlugin((nuxtApp) => {
  // expose factory on `nuxtApp.provide` for optional programmatic access
  nuxtApp.provide('rocketChatAPIFactory', RocketChatAPI)
})