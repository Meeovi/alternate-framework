/**
 * Mesh Initialization Plugin
 *
 * Runs at server startup to initialize the mesh gateway.
 * This ensures mesh is ready before any composables or routes try to use it.
 */

export default defineNuxtPlugin(async () => {
  // Only initialize on server
  if (process.server) {
    try {
      // Dynamic import to avoid circular dependencies
      const { getMeshInstance } = await import('../../../server/mesh')

      // Initialize mesh at server startup
      const mesh = await getMeshInstance()

      console.info('[mesh-plugin] Mesh gateway initialized successfully')

      // Optionally attach to context for debugging
      ;(globalThis as any).__meshInstance = mesh
    } catch (error) {
      console.warn('[mesh-plugin] Failed to initialize mesh:', error instanceof Error ? error.message : String(error))
      // Don't fail the entire app if mesh fails - other layers might not need it
    }
  }
})
