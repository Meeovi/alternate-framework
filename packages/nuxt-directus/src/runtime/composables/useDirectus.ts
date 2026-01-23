import { useNuxtApp } from '#imports';

export function useDirectus() {
  const { $directus } = useNuxtApp();
  return $directus;
}
