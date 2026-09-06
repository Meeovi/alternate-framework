// Positional loader list for the /connect/spaces tabs. spaces.vue maps this
// against Directus navigation item 79's `menus` array by index, so the order
// here must match that live data exactly: Default, Audio, Video, Images, Text
// (whose underlying space_type is named "Forum" — see textSpaces.vue). Each
// component reads its own space_types-filtered data from Directus.
//
// Previously this lived in each consuming app's `app/types/componentMap.ts`
// and was pulled in via `~/types/componentMap` — a layer file reaching into
// app space for content that only ever references this layer. Moved here so
// the social layer is self-contained.
export const componentMap: Array<() => Promise<unknown>> = [
  () => import('#social/app/components/features/spaceSections/defaultSpaces.vue'),
  () => import('#social/app/components/features/spaceSections/audioSpaces.vue'),
  () => import('#social/app/components/features/spaceSections/videoSpaces.vue'),
  () => import('#social/app/components/features/spaceSections/imageSpaces.vue'),
  () => import('#social/app/components/features/spaceSections/textSpaces.vue'),
]
