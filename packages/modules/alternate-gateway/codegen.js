"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config = {
    schema: "app/schema/stitched/index.graphql",
    documents: ["app/**/*.graphql"],
    generates: {
        "app/generated/types.ts": {
            plugins: ["typescript", "typescript-operations", "typed-document-node"]
        }
    },
    ignoreNoDocuments: true
};
exports.default = config;
