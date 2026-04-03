import { useSofa } from "@graphql-yoga/plugin-sofa";
import type { GraphQLSchema } from "graphql";

export const useSofaPlugin = (schema: GraphQLSchema) =>
  useSofa({
    schema,
    basePath: "/rest",
    ignore: ["_service", "_noop"],
    onRoute(info) {
      console.log(`[sofa] ${info.method.toUpperCase()} ${info.path}`);
    }
  });