import type { Plugin } from "graphql-yoga";

export const useHiveUsagePlugin = (): Plugin => ({
  onExecute() {
    return {
      onExecuteDone: ({ result }) => {
        if (process.env.HIVE_DEBUG === "true") {
          const hasErrors = "errors" in result && Array.isArray(result.errors) && result.errors.length > 0;
          console.log("[hive] usage report", { hasErrors });
        }
      }
    };
  }
});