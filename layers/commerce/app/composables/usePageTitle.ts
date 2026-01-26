import useHead from "../modules/vue-head/composables/useHead";
import { useAppConfig } from "nuxt/app";

/**
 * Composable for setting the page title.
 * Used in layouts. Title can be changed in pages through the `useHead` composable.
 */
export const usePageTitle = () => {
  const { titleSuffix } = useAppConfig();

  useHead({
    titleTemplate: (titleChunk: any) => {
      return titleChunk ? `${titleChunk} | ${titleSuffix}` : titleSuffix;
    },
  });
};
