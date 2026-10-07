// Close the shared Redis client when Nitro shuts down — including the end of
// prerendering during `nuxt build`, where an open (or reconnecting) client
// otherwise keeps the build process from exiting.
import { redis } from '../utils/redis'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('close', () => {
    redis.disconnect()
  })
})
