import type { Plugin } from "graphql-yoga";

export type GraphqlArmorConfig = {
  maxAliases: number;
  maxDepth: number;
  maxTokens: number;
  maxDirectives: number;
};

export const graphqlArmorConfig: GraphqlArmorConfig = {
  maxAliases: Number(process.env.GQL_ARMOR_MAX_ALIASES ?? 10),
  maxDepth: Number(process.env.GQL_ARMOR_MAX_DEPTH ?? 10),
  maxTokens: Number(process.env.GQL_ARMOR_MAX_TOKENS ?? 1000),
  maxDirectives: Number(process.env.GQL_ARMOR_MAX_DIRECTIVES ?? 20)
};

export const useGraphqlArmorPlugin = (): Plugin => ({
  onParse({ params, setResult }: any) {
    const source = typeof params?.source === "string" ? params.source : params?.source?.body ?? "";
    const aliasCount = (source.match(/\s+\w+\s*:/g) ?? []).length;
    const directiveCount = (source.match(/@\w+/g) ?? []).length;

    if (aliasCount > graphqlArmorConfig.maxAliases || directiveCount > graphqlArmorConfig.maxDirectives) {
      setResult({
        errors: [
          new Error("GraphQL Armor policy blocked this operation due to aliases/directives limit")
        ]
      });
    }
  }
});