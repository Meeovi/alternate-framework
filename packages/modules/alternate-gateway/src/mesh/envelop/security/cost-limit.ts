import type { Plugin } from "graphql-yoga";

export const useCostLimitPlugin = (): Plugin => ({
  onParse({ params, setResult }: any) {
    const source = typeof params?.source === "string" ? params.source : params?.source?.body ?? "";
    const maxCost = Number(process.env.GQL_MAX_COST ?? 3000);
    const estimatedCost = source.length;

    if (estimatedCost > maxCost) {
      setResult({ errors: [new Error("Query cost limit exceeded")] });
    }
  }
});