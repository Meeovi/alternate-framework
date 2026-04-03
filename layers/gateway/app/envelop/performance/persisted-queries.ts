import { useAPQ } from "@graphql-yoga/plugin-apq";

const store = new Map<string, string>();

export const usePersistedQueriesPlugin = () =>
  useAPQ({
    store
  });