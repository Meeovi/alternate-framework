// types/pageComponentMap.ts
// Typed mapping for page name/slug -> async component loader
// Simplified pageComponentMap: dynamic page-to-component mapping is optional.
// Keeping an empty map avoids build-time resolution of many optional components
// that may not be present in all installations.
export const pageComponentMap = {}

export default pageComponentMap
