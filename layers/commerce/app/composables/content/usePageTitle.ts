import { useAppConfig } from "nuxt/app";

// Avoid relying on ambient auto-imports for `useHead` during typechecking
const _useHead = (globalThis as any).useHead as ((h: any) => void) | undefined


/**
 * Composable for setting the page title.
 * Used in layouts. Title can be changed in pages through the `useHead` composable.
 */
export const usePageTitle = () => {
  const { titleSuffix } = useAppConfig();

  const runner = _useHead || ((globalThis as any).useHead)
  if (typeof runner === 'function') {
    runner({
      titleTemplate: (titleChunk: any) => titleChunk ? `${titleChunk} | ${titleSuffix}` : titleSuffix
    })
  }
};
