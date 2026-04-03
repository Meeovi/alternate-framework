import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "app/schema/stitched/index.graphql",
  documents: ["app/**/*.graphql"],
  generates: {
    "app/generated/types.ts": {
      plugins: ["typescript", "typescript-operations", "typed-document-node"]
    }
  },
  ignoreNoDocuments: true
};

export default config;