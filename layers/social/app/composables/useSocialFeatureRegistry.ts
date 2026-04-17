/**
 * Registry of dynamic social feature components.
 * Maps URL slugs to lazy-loaded components from #social/app/components/features/
 *
 * Usage:
 *   const component = await resolveSocialFeatureComponent('radio')
 *   // Returns the RadioVue component if it exists, null otherwise
 */

const featureComponents = [
  'birthdays',
  'channels',
  'chat',
  'directory',
  'events',
  'feeds',
  'friends',
  'hashtags',
  'invites',
  'media',
  'members',
  'memories',
  'messages',
  'radio',
  'rooms',
  'spaces',
  'teams',
  'vibez',
]

// Promise cache to avoid re-loading same components
const componentCache = new Map<string, Promise<any>>()

export function getSocialFeatureSlugs(): string[] {
  return featureComponents
}

export async function resolveSocialFeatureComponent(slug: string): Promise<any> {
  // Normalize slug to match component name (already lowercase)
  const normalized = slug.toLowerCase()

  if (!featureComponents.includes(normalized)) {
    return null
  }

  // Return cached promise if available
  if (componentCache.has(normalized)) {
    return componentCache.get(normalized)
  }

  try {
    // Dynamically import the component from the features directory
    const ComponentName = normalized.charAt(0).toUpperCase() + normalized.slice(1)
    const componentPromise = import(`../components/features/${normalized}.vue`).then(m => m.default)
    componentCache.set(normalized, componentPromise)
    return componentPromise
  } catch (err) {
    console.warn(`[useSocialFeatureRegistry] Failed to resolve component for slug "${slug}":`, err)
    return null
  }
}

/**
 * Composable to resolve social feature components within Nuxt setup context.
 * Returns the component or null if not found.
 */
export function useSocialFeatureComponent(slug: string) {
  return resolveSocialFeatureComponent(slug)
}

export default {
  getSocialFeatureSlugs,
  resolveSocialFeatureComponent,
  useSocialFeatureComponent,
}
