import { createError, type H3Event } from 'h3'
import { checkVideoLink, LinkError } from './providers'
import { videoBookmarksConfig } from './store'

/** checkVideoLink with the site's settings; a refusal becomes an HTTP error with the reason. */
export async function checkLink(event: H3Event, url: string, memberText: string[] = []) {
  const config = videoBookmarksConfig(event)
  try {
    return await checkVideoLink(url, { safety: config.safety, youtubeApiKey: config.youtubeApiKey, memberText })
  } catch (error) {
    if (error instanceof LinkError) {
      if (error.code === 'adult') console.warn('[video-bookmarks] refused an adult link')
      throw createError({ statusCode: error.statusCode, statusMessage: error.message, data: { code: error.code } })
    }
    throw error
  }
}
